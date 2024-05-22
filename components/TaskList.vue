<template>
  <div class="space-y-3">
    <UButtonGroup class="w-full">
      <UInput
        v-model="title"
        class="w-full"
        type="text"
        placeholder="New task"
        autofocus
        @keyup.enter="createTask"
      />
      <UButton type="button" :disabled="!title" @click="createTask">
        Create
      </UButton>
    </UButtonGroup>

    <TransitionGroup
      v-if="data?.length"
      name="list"
      class="relative space-y-1"
      tag="ul"
    >
      <li
        v-for="task in data"
        :key="task.id"
        class="flex w-full items-center space-x-2"
      >
        <p
          class="w-full leading-tight"
          :class="{ 'line-through opacity-50': task.completed }"
        >
          {{ task.title }}
        </p>

        <UToggle
          :disabled="deleting.includes(task.id)"
          :loading="completing.includes(task.id)"
          :model-value="task.completed"
          @update:model-value="completeTask(task)"
        />

        <UButton
          color="red"
          variant="soft"
          size="2xs"
          icon="i-heroicons-x-mark-20-solid"
          :disabled="completing.includes(task.id)"
          :loading="deleting.includes(task.id)"
          @click="deleteTask(task)"
        />
      </li>
    </TransitionGroup>

    <div v-else class="w-full text-center">You've got nothing to do! 🎉</div>
  </div>
</template>

<script setup lang="ts">
import type { Database, Tables } from '@/types/supabase'

type Task = Tables<'tasks'>

const client = useSupabaseClient<Database>()
const toast = useToast()
const title = ref('')
const completing = ref<number[]>([])
const deleting = ref<number[]>([])

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
  completing.value.push(task.id)

  const { error } = await client
    .from('tasks')
    .update({ completed: !task.completed })
    .eq('id', task.id)

  if (error) {
    toast.add({
      color: 'red',
      icon: 'i-heroicons-exclamation-circle-20-solid',
      title: error.message,
    })
  } else {
    await refresh()
  }

  completing.value = completing.value.filter((id) => id !== task.id)
}

async function deleteTask(task: Task) {
  deleting.value.push(task.id)

  const { error } = await client.from('tasks').delete().eq('id', task.id)

  if (error) {
    toast.add({
      color: 'red',
      icon: 'i-heroicons-exclamation-circle-20-solid',
      title: error.message,
    })
  } else {
    await refresh()
  }

  deleting.value = deleting.value.filter((id) => id !== task.id)
}
</script>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  @apply transition-all duration-200 ease-in-out;
}

.list-enter-from,
.list-leave-to {
  @apply translate-x-8 opacity-0;
}

.list-leave-active {
  @apply absolute;
}
</style>
