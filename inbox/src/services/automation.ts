import { supabase } from '@/lib/supabase'

export async function processAutomation(
  channel: string,
  message: string
) {
  const { data } = await supabase
    .from('automations')
    .select('*')
    .eq('channel', channel)
    .eq('active', true)

  const matched = data?.find((item) =>
    message.toLowerCase().includes(
      item.trigger_keyword.toLowerCase()
    )
  )

  return matched?.response_message || null
}