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
          v-hasPerm="['product:brand:add']"
          type="success"
          icon="plus"
          @click="handleOpenDialog()"
        >
          新增
        </el-button>
        <el-button
          v-hasPerm="['product:brand:delete']"
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
        <el-table-column key="id" label="品牌ID" prop="id" min-width="150" align="center" />
        <el-table-column key="name" label="品牌名称" prop="name" min-width="150" align="center" />
        <el-table-column
          key="logoUrl"
          label="品牌Logo URL"
          prop="logoUrl"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="description"
          label="品牌描述"
          prop="description"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="website"
          label="官方网站"
          prop="website"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="status"
          label="状态：0-禁用，1-启用"
          prop="status"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="sortOrder"
          label="排序值，越大越靠前"
          prop="sortOrder"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="createTime"
          label=""
          prop="createTime"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="updateTime"
          label=""
          prop="updateTime"
          min-width="150"
          align="center"
        />
        <el-table-column fixed="right" label="操作" width="220">
          <template #default="scope">
            <el-button
              v-hasPerm="['product:brand:edit']"
              type="primary"
              size="small"
              link
              icon="edit"
              @click="handleOpenDialog(scope.row.id)"
            >
              编辑
            </el-button>
            <el-button
              v-hasPerm="['product:brand:delete']"
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

    <!-- 品牌表单弹窗 -->
    <el-drawer
      v-model="dialog.visible"
      :title="dialog.title"
      :size="drawerSize"
      @close="handleCloseDialog"
    >
      <el-form ref="dataFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-input v-model="formData.id" type="hidden" />
        <el-form-item label="品牌名称" prop="name">
          <el-input v-model="formData.name" placeholder="品牌名称" />
        </el-form-item>

        <el-form-item label="品牌Logo" prop="logoUrl">
          <el-input v-model="formData.logoUrl" placeholder="品牌Logo URL" />
        </el-form-item>

        <el-form-item label="品牌描述" prop="description">
          <el-input v-model="formData.description" type="textarea" placeholder="品牌描述" />
        </el-form-item>

        <el-form-item label="官方网站" prop="website">
          <el-input v-model="formData.website" placeholder="官方网站" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
        </el-form-item>

        <el-form-item label="排序值，越大越靠前" prop="sortOrder">
          <el-input-number v-model="formData.sortOrder" placeholder="排序值，越大越靠前" />
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
  name: "Brand",
  inheritAttrs: false,
});

import BrandAPI, { BrandPageVO, BrandForm, BrandPageQuery } from "@/api/product/brand-api";

import { useAppStore } from "@/store/modules/app-store";
import { DeviceEnum } from "@/enums/settings/device-enum";
const appStore = useAppStore();
const drawerSize = computed(() => (appStore.device === DeviceEnum.DESKTOP ? "600px" : "90%"));

const queryFormRef = ref();
const dataFormRef = ref();

const loading = ref(false);
const removeIds = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<BrandPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

// 品牌表格数据
const pageData = ref<BrandPageVO[]>([]);

// 弹窗
const dialog = reactive({
  title: "",
  visible: false,
});

// 品牌表单数据
const formData = reactive<BrandForm>({});

// 品牌表单校验规则
const rules = reactive({
  id: [{ required: true, message: "请输入品牌ID", trigger: "blur" }],
  name: [{ required: true, message: "请输入品牌名称", trigger: "blur" }],
  status: [{ required: true, message: "请输入状态：0-禁用，1-启用", trigger: "blur" }],
  sortOrder: [{ required: true, message: "请输入排序值，越大越靠前", trigger: "blur" }],
});

/** 查询品牌 */
function handleQuery() {
  loading.value = true;
  BrandAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

/** 重置品牌查询 */
function handleResetQuery() {
  queryFormRef.value!.resetFields();
  queryParams.pageNum = 1;
  handleQuery();
}

/** 行复选框选中记录选中ID集合 */
function handleSelectionChange(selection: any) {
  removeIds.value = selection.map((item: any) => item.id);
}

/** 打开品牌弹窗 */
function handleOpenDialog(id?: number) {
  dialog.visible = true;
  if (id) {
    dialog.title = "修改品牌";
    BrandAPI.getFormData(id).then((data) => {
      Object.assign(formData, data);
    });
  } else {
    dialog.title = "新增品牌";
  }
}

/** 提交品牌表单 */
function handleSubmit() {
  dataFormRef.value.validate((valid: any) => {
    if (valid) {
      loading.value = true;
      const id = formData.id;
      if (id) {
        BrandAPI.update(id, formData)
          .then(() => {
            ElMessage.success("修改成功");
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        BrandAPI.add(formData)
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

/** 关闭品牌弹窗 */
function handleCloseDialog() {
  dialog.visible = false;
  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();
  formData.id = undefined;
}

/** 删除品牌 */
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
      BrandAPI.deleteByIds(ids)
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
