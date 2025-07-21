import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { getSystemPrompt, generateTitle } from '@/lib/ai/prompts'
import { NextRequest } from 'next/server'
import type { ConversationMode } from '@/types/database'

export async function POST(req: NextRequest) {
  try {
    const { messages, conversationId, mode = 'challenge' } = await req.json()
    
    const supabase = createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Check user credits and create profile if it doesn't exist
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits_remaining, subscription_tier')
      .eq('id', user.id)
      .single()

    // If profile doesn't exist, create it
    if (profileError && profileError.code === 'PGRST116') {
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || 
                     user.user_metadata?.name || 
                     user.email?.split('@')[0] || 
                     'User',
          avatar_url: user.user_metadata?.avatar_url || 
                      user.user_metadata?.picture || 
                      null,
          credits_remaining: 5,
          subscription_tier: 'free'
        })
        .select('credits_remaining, subscription_tier')
        .single()

      if (createError) {
        console.error('Error creating profile in chat API:', createError)
        return new Response('Profile creation failed', { status: 500 })
      }
      
      profile = newProfile
    } else if (profileError) {
      console.error('Error fetching profile:', profileError)
      return new Response('Profile fetch failed', { status: 500 })
    }

    if (profile && profile.credits_remaining <= 0 && profile.subscription_tier === 'free') {
      return new Response('No credits remaining', { status: 402 })
    }

    let currentConversationId = conversationId

    // Create new conversation if none exists
    if (!conversationId) {
      const title = generateTitle(messages[0].content)
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title,
          mode: mode as ConversationMode,
          system_prompt: getSystemPrompt(mode as ConversationMode),
        })
        .select()
        .single()

      if (conversationError) {
        console.error('Error creating conversation:', conversationError)
        return new Response('Failed to create conversation', { status: 500 })
      }

      currentConversationId = conversation.id
    }

    // Save user message
    const userMessage = messages[messages.length - 1]
    await supabase.from('messages').insert({
      conversation_id: currentConversationId,
      role: 'user',
      content: userMessage.content,
    })

    // Get conversation context for system prompt
    const { data: conversation } = await supabase
      .from('conversations')
      .select('system_prompt, mode')
      .eq('id', currentConversationId)
      .single()

    const systemPrompt = conversation?.system_prompt || getSystemPrompt(mode as ConversationMode)

    // Stream response from OpenAI
    const result = await streamText({
      model: openai('gpt-4-turbo-preview'),
      system: systemPrompt,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: 0.7,
      maxTokens: 1500,
      onFinish: async (completion) => {
        // Save assistant response
        await supabase.from('messages').insert({
          conversation_id: currentConversationId,
          role: 'assistant',
          content: completion.text,
          tokens_used: completion.usage?.totalTokens || 0,
        })

        // Deduct credit for free users
        if (profile?.subscription_tier === 'free') {
          await supabase
            .from('profiles')
            .update({ 
              credits_remaining: Math.max(0, profile.credits_remaining - 1),
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)
        }
      },
    })

    return result.toDataStreamResponse({
      headers: {
        'X-Conversation-Id': currentConversationId,
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}