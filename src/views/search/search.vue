<template>
  <div>
    <div v-if="state.group">
      <div class="flex flex-col justify-center py-3 border-b-2 border-gray-300">
        <div class="md:flex-row md:pt-3 md:pl-2 flex flex-col items-baseline">
          <h1 class="md:px-10 min-w-max px-3 py-1 text-2xl text-gray-700">
            <router-link :to="{ path: '/' }">落絮</router-link>
          </h1>
          <form class="md:px-0 w-full px-3 py-1" @submit.prevent="search">
            <div
              class="md:w-4/5 flex w-full px-2 border-2 border-gray-200 rounded-lg shadow-md"
            >
              <input
                v-model="state.query"
                class="w-full p-2 m-2 border-none"
                type="text"
                required
              />

              <button class="p-1 my-2 font-bold">
                <icon-search-circle class="text-gray-500" />
              </button>
            </div>
            <div class="flex flex-row space-x-4 pt-3 items-center">
              <span>
                <select v-model="filter_time_select" @change="search">
                  <option
                    v-for="opt in filter_time_select_opts"
                    :value="opt.id"
                    :key="opt.id"
                  >
                    {{ opt.name }}
                  </option>
                </select>
              </span>
              <span v-show="filter_time_select === 6">
                <span>
                  <input
                    name="time_start"
                    v-model="start_time"
                    class="p-2 m-2 border-2 border-gray-200 rounded-lg shadow-md"
                    type="text"
                    required
                    placeholder="YYYY-MM-DD"
                  />
                </span>
                -
                <span>
                  <input
                    name="time_end"
                    v-model="end_time"
                    class="p-2 m-2 border-2 border-gray-200 rounded-lg shadow-md"
                    type="text"
                    required
                    placeholder="YYYY-MM-DD"
                  />
                </span>
              </span>
            </div>
          </form>
        </div>

        <h1 class="md:px-44 px-3 pt-1 text-gray-800">
          @{{ state.group.pub_id }}
        </h1>
      </div>

      <div v-if="state.messages" class="md:px-44 px-3">
        <div class="px-1 py-2 text-gray-500">
          找到 {{ state.messages.length }} 条消息 --
        </div>
        <div
          v-for="message in state.messages"
          class="py-2"
          :key="message.id + ',' + state.query"
        >
          <message-card :message="message" :search="state.query" />
        </div>
      </div>
    </div>
    <div v-else class="flex justify-center my-8">
      <search-loading :state="state" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, onMounted, ref } from "vue"
import { useRouter, useRoute } from "vue-router"
import { SearchState as State } from "./search-state"

export default defineComponent({
  name: "search",
  components: {
    "message-card": require("@/components/message-card").default,
    "search-loading": require("@/views/search/search-loading.vue").default,
    "icon-search-circle": require("@/components/icons/icon-search-circle.vue")
      .default,
  },
  props: {
    group_id: { type: Number, required: true },
    query: { type: String, required: true },
    sender: { type: Number, default: null },
    start: { type: Number, default: null },
    end: { type: Number, default: null },
    filter_time: { type: Number, default: 0 },
  },
  setup(props) {
    const router = useRouter()
    const route = useRoute()

    const filter_time_select = ref(0)
    const filter_time_select_opts = ref([
      { id: 0, name: "不限时间" },
      { id: 1, name: "过去 1 小时" },
      { id: 2, name: "过去 24 小时" },
      { id: 3, name: "过去 1 周" },
      { id: 4, name: "过去 1 个月" },
      { id: 5, name: "过去 1 年" },
      { id: 6, name: "自订时间范围" },
    ])
    const start_time = ref("")
    const end_time = ref("")

    const state = reactive<State>(
      new State({
        group_id: props.group_id,
        query: props.query,
        sender: props.sender,
        start: props.start,
        end: props.end,
      })
    )
    filter_time_select.value = props.filter_time
    if (props.start) {
      start_time.value = timestamp_transfer_string(props.start)
    }
    if (props.end) {
      end_time.value = timestamp_transfer_string(props.end)
    }

    onMounted(async () => {
      await state.search()
    })

    function timestamp_transfer_string(timestamp: number): string {
      var date = new Date(timestamp * 1000)
      const YYYY = date.getFullYear()
      const MM = (date.getMonth() + 1).toString()
      const DD = date.getDate().toString()
      return `${YYYY}-${MM}-${DD}`
    }

    function string_transfer_timestamp(s: string): number {
      s = s.replace(/-/g, "/")
      return Math.round(new Date(s).getTime() / 1000)
    }

    function timestamp(): { start: any; end: any } {
      console.log("timestamp")
      let result: any = {
        start: null,
        end: null,
      }
      const current_time = Math.round(new Date().getTime() / 1000)
      console.log(filter_time_select)
      switch (filter_time_select.value) {
        case 1:
          result.start = current_time - 3600
          console.log(1)
          break
        case 2:
          result.start = current_time - 3600
          console.log(2)
          break
        case 3:
          result.start = current_time - 86400
          console.log(3)
          break
        case 4:
          result.start = current_time - 604800
          console.log(4)
          break
        case 5:
          result.start = current_time - 2629743
          console.log(5)
          break
        case 6:
          result.start = string_transfer_timestamp(start_time.value)
          result.end = string_transfer_timestamp(end_time.value)
          break
        default:
          break
      }
      return result
    }

    async function search(): Promise<void> {
      const filter_time = timestamp()
      console.log(filter_time)

      state.start = filter_time.start
      state.end = filter_time.end

      const query: any = {
        g: props.group_id.toString(),
        q: state.query,
      }
      if (state.start) {
        query.start = state.start
      }
      if (state.end) {
        query.end = state.end
      }

      console.log(query)

      await state.search()

      if (query.g !== route.query.g || query.q !== route.query.q) {
        router.push({ path: "/search", query })
      } else {
        if (
          query.start !== route.query.start ||
          query.end !== route.query.end
        ) {
          router.push({ path: "/search", query })
        }
      }
    }

    return {
      state,
      search,
      filter_time_select,
      filter_time_select_opts,
      start_time,
      end_time,
    }
  },
})
</script>
