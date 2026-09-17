<template>
  <a-card :bordered="false">
    <main id="todolist">
      <a-button type="primary" @click="showModal">新增待办</a-button>
      <h1>
        待办事务
        <span>仅展示今日待办事务,今日以外的事务请在日程中查看。</span>
      </h1>
      <div class="todolist-wrapper">
        <div
          v-for="(item, index) in todo"
          :key="index"
          :class="{ 'has-done': item.done }"
          class="todoitem"
        >
          <div class="todo-label">{{ item.label }}</div>
          <div class="todo-action">
            <!--
              antdv4 的 a-switch 是纯受控组件：只写 :checked 而不回写数据的话，
              点击后 change 会触发但开关视觉不动。
              原代码用 @click 手动取反，这里改成语义等价的 @change（click 在受控组件上
              的触发时机早于内部状态更新，容易被误读），切换逻辑仍走 changeState。
            -->
            <div>
              <a-switch
                :checked="item.done"
                checked-children="已完成"
                un-checked-children="待完成"
                @change="changeState(index)"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
    <!-- 新增 -->
    <div>
      <a-modal v-model:open="visible" title="新增待办事务" @ok="handleSubmit">
        <a-form ref="formRef" :model="form" :rules="rules">
          <a-form-item
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 12 }"
            label="事务内容"
            name="label"
          >
            <a-input v-model:value="form.label" placeholder="请输入事务内容"/>
          </a-form-item>
          <a-form-item
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 12 }"
            label="事务完成日期"
            name="date"
          >
            <!-- 原 :defaultValue="defaultDate" → 受控 v-model:value，初值仍是 moment() -->
            <a-date-picker
              v-model:value="form.date"
              style="width: 100%"
              @change="onChange"
            />
          </a-form-item>
          <a-alert banner closable message="今日以外的事务将自动添加到日程中。"/>
        </a-form>
      </a-modal>
    </div>
  </a-card>
</template>

<script lang="ts" setup>
import {computed, reactive, ref} from 'vue'
import type {FormInstance} from 'ant-design-vue'
import moment from 'moment'

defineOptions({name: 'UserTodo'})

interface TodoItem {
  id?: number
  label: string
  done: boolean
  date?: unknown
}

const emit = defineEmits<{ (e: 'clicked', v: boolean): void }>()

const formRef = ref<FormInstance | null>(null)

const form = reactive<{ label: string; date: unknown }>({
  label: '',
  // ⚠️ antdv4 的日期控件只吃 dayjs 对象，给字符串会在子组件 setup 阶段抛
  // `date.locale is not a function` 并让整页空白。moment 已别名到 dayjs 兼容层，可直接用。
  date: moment()
})

// ⚠️ name / form 的键 / rules 的键三者必须一致，否则校验静默不触发
const rules: Record<string, { required: boolean; message: string }[]> = {
  label: [{required: true, message: '事务内容为必填项！'}]
}

const newitem = ref('')
const sortByStatus = ref(false)
const isactive = ref(false)
const visible = ref(false)

const todo = ref<TodoItem[]>([
  {id: 1, label: 'Learn VueJs', done: true},
  {id: 2, label: 'Code a todo list', done: false},
  {id: 3, label: 'Learn something else', done: false}
])

// 原 computed todoByStatus（当前模板未引用，保留以维持原状）
const todoByStatus = computed<TodoItem[]>(() => {
  if (!sortByStatus.value) {
    return todo.value
  }
  const doneArray = todo.value.filter((item) => item.done)
  const notDoneArray = todo.value.filter((item) => !item.done)
  return [...notDoneArray, ...doneArray]
})
void todoByStatus

function showModal() {
  visible.value = true
}

// 原 methods.handleOk —— 模板未引用，保留
function handleOk() {
  visible.value = false
}

void handleOk

function onChange(_date: unknown, _dateString: string) {
  // 原实现为空函数
}

void onChange

// 原 onToogle —— 模板未引用，保留
function onToogle() {
  emit('clicked', isactive.value)
}

void onToogle

function changeState(index: number) {
  // 原 this.$set(this.todo, index, {...}) → Vue 3 直接赋值即可
  const current = todo.value[index]
  todo.value[index] = {...current, done: !current.done}
}

// 原 addItem —— 模板未引用，保留
function addItem() {
  todo.value.push({
    id: Math.floor(Math.random() * 9999) + 10,
    label: newitem.value,
    done: false
  })
  newitem.value = ''
}

void addItem

function markAsDoneOrUndone(item: TodoItem) {
  item.done = !item.done
}

void markAsDoneOrUndone

function deleteItemFromList(item: TodoItem) {
  const index = todo.value.indexOf(item)
  if (index !== -1) todo.value.splice(index, 1)
}

void deleteItemFromList

function clickontoogle(active: boolean) {
  sortByStatus.value = active
}

void clickontoogle

function handleSubmit(e?: Event) {
  e?.preventDefault?.()
  formRef.value
    ?.validate()
    .then((values: unknown) => {
      visible.value = false
      todo.value.unshift({...(values as Record<string, unknown>), done: false} as TodoItem)
    })
    .catch(() => {
      // 校验未通过：保持弹窗打开（原实现同样是 if (!err) 才关闭）
    })
}
</script>

<style lang="less" scoped>
#todolist {
  padding-top: 10px;
}

#todolist h1 {
  /*text-align:center;*/
  font-weight: normal;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #eee;
}

#todolist h1 span {
  display: block;
  font-size: 12px;
  margin-bottom: 10px;
  margin-left: 3px;
  margin-top: 0.2rem;
}

.todolist-wrapper {
  .todoitem {
    min-height: 50px;
    line-height: 1.5;
    // 深色模式下写死的 #f8f8f8 会是一整块亮底；浅色下 #fafafa 与原值肉眼无差
    background: var(--background-color-light, #f8f8f8);
    display: flex;
    color: #333;
    margin-bottom: 8px;

    // #333 落在深色底上几乎看不见；浅色保持原值，不动既有观感
    html[data-theme='dark'] & {
      color: var(--text-color, #333);
    }

    &.has-done {
      .todo-label {
        text-decoration: line-through;
        color: #ccc;
      }
    }

    .todo-label {
      flex: 1;
      font-size: 18px;
      padding-top: 10px;
      padding-left: 10px;
    }

    .todo-action {
      width: 100px;
      line-height: 50px;
      display: flex;
      justify-content: space-around;

      .anticon-delete {
        line-height: 50px;
        cursor: pointer;
      }
    }
  }
}
</style>
