import { Group } from "@/models/group"
import { Message } from "@/models/message"
import client from "@/clients/luoxu-client-instance"

export class SearchState {
  group_id: number
  query: string
  sender: number
  start: number
  end: number

  group: null | Group = null
  messages: null | Array<Message> = null

  constructor(opts: { group_id: number; query: string; sender:number; start:number; end:number }) {
    this.group_id = opts.group_id
    this.query = opts.query
    this.sender = opts.sender
    this.start = opts.start
    this.end = opts.end
  }

  async search(): Promise<void> {
    const result = await client.search({
      group_id: this.group_id,
      query: this.query,
      sender: this.sender,
      start: this.start,
      end: this.end,
    })

    const group = Group.from_search_result(result)

    this.group = group

    if (this.query) {
      this.messages = result.messages.map((message) =>
        Message.from_message_result_and_group({
          ...message,
          group,
        })
      )
    } else {
      this.messages = null
    }
  }
}
