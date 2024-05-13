<template>
  <div class="max-w-xs space-y-3">
    <ul v-if="data" class="space-y-1">
      <li
        v-for="task in data"
        :key="task.id"
        class="flex w-full items-center space-x-2"
      >
        <p class="w-full" :class="{ 'line-through': task.completed }">
          {{ task.title }}
        </p>

        <UToggle
          :disabled="disabled === task.id"
          :model-value="task.completed"
          @update:model-value="completeTask(task)"
        />

        <UButton
          color="red"
          variant="soft"
          size="2xs"
          icon="i-heroicons-x-mark-20-solid"
          :disabled="disabled === task.id"
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

const { data, refresh } = useAsyncData(async () => {
  const { data: tasks } = await client
    .from('tasks')
    .select('*')
    .order('created_at')
  return tasks
})

const title = ref('')

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

const disabled = ref<number>()

async function completeTask(task: Task) {
  disabled.value = task.id

  const { error } = await client
    .from('tasks')
    .update({ completed: !task.completed })
    .eq('id', task.id)

  if (error) {
    alert(error.message)
  } else {
    await refresh()
  }

  disabled.value = undefined
}

async function deleteTask(task: Task) {
  disabled.value = task.id

  const { error } = await client.from('tasks').delete().eq('id', task.id)

  if (error) {
    alert(error.message)
  } else {
    await refresh()
  }

  disabled.value = undefined
}
</script>
