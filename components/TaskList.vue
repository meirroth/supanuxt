<template>
  <div class="max-w-xs space-y-3">
    <ul v-if="data" class="space-y-1">
      <li
        v-for="task in data"
        :key="task.id"
        class="flex w-full items-center space-x-2"
      >
        <p
          class="w-full leading-tight"
          :class="{ 'line-through': task.completed }"
        >
          {{ task.title }}
        </p>

        <UToggle
          :disabled="disabled.includes(task.id)"
          :model-value="task.completed"
          @update:model-value="completeTask(task)"
        />

        <UButton
          color="red"
          variant="soft"
          size="2xs"
          icon="i-heroicons-x-mark-20-solid"
          :disabled="disabled.includes(task.id)"
          :loading="disabled.includes(task.id)"
          @click="deleteTask(task)"
        />
      </li>
    </ul>

    <UButtonGroup class="w-full">
      <UInput
        v-model="title"
        class="w-full"
        type="text"
        placeholder="New task"
      />
      <UButton type="submit" :disabled="!title" @click="createTask">
        Create
      </UButton>
    </UButtonGroup>
  </div>
</template>

<script setup lang="ts">
import type { Database, Tables } from '@/types/supabase'

type Task = Tables<'tasks'>

const client = useSupabaseClient<Database>()
const toast = useToast()
const title = ref('')
const disabled = ref<number[]>([])

const { data, refresh } = useAsyncData(async () => {
  const { data: tasks } = await client
    .from('tasks')
    .select('*')
    .order('completed')
    .order('updated_at', { ascending: false })
  return tasks
})

async function createTask() {
  if (!title.value) return

  const { error } = await client
    .from('tasks')
    .insert({ title: title.value, completed: false })

  if (error) {
    alert(error.message)
  } else {
    title.value = ''
    refresh()
  }
}

async function completeTask(task: Task) {
  disabled.value.push(task.id)

  const { error } = await client
    .from('tasks')
    .update({ completed: !task.completed })
    .eq('id', task.id)

  if (error) {
    toast.add({ color: 'red', title: error.message })
  } else {
    await refresh()
  }

  disabled.value = disabled.value.filter((id) => id !== task.id)
}

async function deleteTask(task: Task) {
  disabled.value.push(task.id)

  const { error } = await client.from('tasks').delete().eq('id', task.id)

  if (error) {
    toast.add({ color: 'red', title: error.message })
  } else {
    await refresh()
  }

  disabled.value = disabled.value.filter((id) => id !== task.id)
}
</script>
