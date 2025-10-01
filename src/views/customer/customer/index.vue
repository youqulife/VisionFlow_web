<template>
  <div class="app-container">
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item class="search-buttons">
          <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
          <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="never">
      <div class="mb-10px">
        <el-button
          v-hasPerm="['customer:customer:add']"
          type="success"
          icon="plus"
          @click="handleOpenDialog()"
        >
          新增
        </el-button>
        <el-button
          v-hasPerm="['customer:customer:delete']"
          type="danger"
          :disabled="removeIds.length === 0"
          icon="delete"
          @click="handleDelete()"
        >
          删除
        </el-button>
      </div>

      <el-table
        ref="dataTableRef"
        v-loading="loading"
        :data="pageData"
        highlight-current-row
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column key="id" label="主键ID" prop="id" min-width="150" align="center" />
        <el-table-column key="name" label="顾客姓名" prop="name" min-width="150" align="center" />
        <el-table-column key="phone" label="手机号码" prop="phone" min-width="150" align="center" />
        <el-table-column label="性别" width="150" align="center">
          <template #default="scope">
            <DictLabel v-model="scope.row.gender" code="gender" />
          </template>
        </el-table-column>
        <el-table-column
          key="birthday"
          label="生日"
          prop="birthday"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="source"
          label="顾客来源"
          prop="source"
          min-width="150"
          align="center"
        />
        <el-table-column key="tags" label="顾客标签" prop="tags" min-width="150" align="center" />
        <el-table-column
          key="memberLevel"
          label="会员等级"
          prop="memberLevel"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="balance"
          label="账户余额"
          prop="balance"
          min-width="150"
          align="center"
        />
        <el-table-column key="notes" label="备注信息" prop="notes" min-width="150" align="center" />
        <el-table-column
          key="createdAt"
          label="记录创建时间"
          prop="createdAt"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="updatedAt"
          label="记录最后更新时间"
          prop="updatedAt"
          min-width="150"
          align="center"
        />
        <el-table-column fixed="right" label="操作" width="220">
          <template #default="scope">
            <el-button
              v-hasPerm="['customer:customer:edit']"
              type="primary"
              size="small"
              link
              icon="edit"
              @click="handleOpenDialog(scope.row.id)"
            >
              编辑
            </el-button>
            <el-button
              v-hasPerm="['customer:customer:delete']"
              type="danger"
              size="small"
              link
              icon="delete"
              @click="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="handleQuery()"
      />
    </el-card>

    <!-- 顾客信息表单弹窗 -->
    <el-drawer
      v-model="dialog.visible"
      :title="dialog.title"
      width="500px"
      @close="handleCloseDialog"
    >
      <el-form ref="dataFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-input v-model="formData.id" type="hidden" />
        <el-form-item label="顾客姓名" prop="name">
          <el-input v-model="formData.name" placeholder="顾客姓名" />
        </el-form-item>

        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="formData.phone" placeholder="手机号码（可作为唯一标识）" />
        </el-form-item>

        <el-form-item label="性别" prop="gender">
          <Dict v-model="formData.gender" code="gender" />
        </el-form-item>

        <el-form-item label="生日" prop="birthday">
          <el-date-picker
            v-model="formData.birthday"
            class="!w-[240px]"
            type="date"
            placeholder="生日（用于客户关怀和营销）"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item label="顾客来源" prop="source">
          <el-input
            v-model="formData.source"
            placeholder="顾客来源：如'大众点评'、'朋友推荐'、'线下自然流量'等"
          />
        </el-form-item>

        <el-form-item label="备注信息" prop="notes">
          <el-input
            v-model="formData.notes"
            type="textarea"
            placeholder="备注信息：顾客偏好、特殊需求、病史等"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit()">确定</el-button>
          <el-button @click="handleCloseDialog()">取消</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Customer",
  inheritAttrs: false,
});

import CustomerAPI, {
  CustomerPageVO,
  CustomerForm,
  CustomerPageQuery,
} from "@/api/customer/customer-api";

const queryFormRef = ref();
const dataFormRef = ref();

const loading = ref(false);
const removeIds = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<CustomerPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

// 顾客信息表格数据
const pageData = ref<CustomerPageVO[]>([]);

// 弹窗
const dialog = reactive({
  title: "",
  visible: false,
});

// 顾客信息表单数据
const formData = reactive<CustomerForm>({});

// 顾客信息表单校验规则
const rules = reactive({
  name: [{ required: true, message: "请输入顾客姓名", trigger: "blur" }],
  phone: [{ required: true, message: "请输入手机号码（可作为唯一标识）", trigger: "blur" }],
  gender: [
    { required: true, message: "请输入性别：male-男, female-女, unknown-未知", trigger: "blur" },
  ],
});

/** 查询顾客信息 */
function handleQuery() {
  loading.value = true;
  CustomerAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

/** 重置顾客信息查询 */
function handleResetQuery() {
  queryFormRef.value!.resetFields();
  queryParams.pageNum = 1;
  handleQuery();
}

/** 行复选框选中记录选中ID集合 */
function handleSelectionChange(selection: any) {
  removeIds.value = selection.map((item: any) => item.id);
}

/** 打开顾客信息弹窗 */
function handleOpenDialog(id?: number) {
  dialog.visible = true;
  if (id) {
    dialog.title = "修改顾客信息";
    CustomerAPI.getFormData(id).then((data) => {
      Object.assign(formData, data);
    });
  } else {
    dialog.title = "新增顾客信息";
  }
}

/** 提交顾客信息表单 */
function handleSubmit() {
  dataFormRef.value.validate((valid: any) => {
    if (valid) {
      loading.value = true;
      const id = formData.id;
      if (id) {
        CustomerAPI.update(id, formData)
          .then(() => {
            ElMessage.success("修改成功");
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        CustomerAPI.create(formData)
          .then(() => {
            ElMessage.success("新增成功");
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}

/** 关闭顾客信息弹窗 */
function handleCloseDialog() {
  dialog.visible = false;
  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();
  formData.id = undefined;
}

/** 删除顾客信息 */
function handleDelete(id?: number) {
  const ids = [id || removeIds.value].join(",");
  if (!ids) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      loading.value = true;
      CustomerAPI.deleteByIds(ids)
        .then(() => {
          ElMessage.success("删除成功");
          handleResetQuery();
        })
        .finally(() => (loading.value = false));
    },
    () => {
      ElMessage.info("已取消删除");
    }
  );
}

onMounted(() => {
  handleQuery();
});
</script>
