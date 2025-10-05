<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="关键字" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            placeholder="分类名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
          <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="data-table">
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <el-button
            v-hasPerm="['product:category:add']"
            type="success"
            icon="plus"
            @click="handleOpenDialog(0)"
          >
            新增
          </el-button>
        </div>
      </div>

      <el-table
        ref="dataTableRef"
        v-loading="loading"
        row-key="id"
        :data="categoryTableData"
        :tree-props="{
          children: 'children',
          hasChildren: 'hasChildren',
        }"
        class="data-table__content"
        default-expand-all
        @row-click="handleRowClick"
      >
        <el-table-column label="分类名称" min-width="200">
          <template #default="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>

        <el-table-column label="排序" align="center" width="80" prop="sortOrder" />
        <el-table-column label="状态" align="center" width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.isActive === 1" type="success">启用</el-tag>
            <el-tag v-else type="info">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="描述" align="left" prop="description" />

        <el-table-column fixed="right" align="center" label="操作" width="220">
          <template #default="scope">
            <el-button
              v-hasPerm="['product:category:add']"
              type="primary"
              link
              size="small"
              icon="plus"
              @click.stop="handleOpenDialog(scope.row.id)"
            >
              新增
            </el-button>

            <el-button
              v-hasPerm="['product:category:edit']"
              type="primary"
              link
              size="small"
              icon="edit"
              @click.stop="handleOpenDialog(undefined, scope.row.id)"
            >
              编辑
            </el-button>
            <el-button
              v-hasPerm="['product:category:delete']"
              type="danger"
              link
              size="small"
              icon="delete"
              @click.stop="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-drawer
      v-model="dialog.visible"
      :title="dialog.title"
      :size="drawerSize"
      @close="handleCloseDialog"
    >
      <el-form ref="categoryFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="父级分类" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            placeholder="选择上级分类"
            :data="categoryOptions"
            filterable
            check-strictly
            :render-after-expand="false"
          />
        </el-form-item>

        <el-form-item label="分类名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分类名称" />
        </el-form-item>

        <el-form-item label="排序" prop="sortOrder">
          <el-input-number
            v-model="formData.sortOrder"
            style="width: 100px"
            controls-position="right"
            :min="0"
          />
        </el-form-item>

        <el-form-item label="状态" prop="isActive">
          <el-radio-group v-model="formData.isActive">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            placeholder="请输入分类描述"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="handleCloseDialog">取 消</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import CategoryAPI, { CategoryQuery, CategoryForm, CategoryVO } from "@/api/product/category-api";

defineOptions({
  name: "Category",
  inheritAttrs: false,
});

const queryFormRef = ref();
const categoryFormRef = ref();

const loading = ref(false);
const dialog = reactive({
  title: "新增分类",
  visible: false,
});

import { useAppStore } from "@/store/modules/app-store";
import { DeviceEnum } from "@/enums/settings/device-enum";
const appStore = useAppStore();
const drawerSize = computed(() => (appStore.device === DeviceEnum.DESKTOP ? "600px" : "90%"));
// 查询参数
const queryParams = reactive<CategoryQuery>({});
// 分类表格数据
const categoryTableData = ref<CategoryVO[]>([]);
// 父级分类下拉选项
const categoryOptions = ref<OptionType[]>([]);
// 初始分类表单数据
const initialCategoryFormData = ref<CategoryForm>({
  id: undefined,
  parentId: 0,
  name: "",
  sortOrder: 1,
  isActive: 1,
  description: "",
});
// 分类表单数据
const formData = ref({ ...initialCategoryFormData.value });
// 表单验证规则
const rules = reactive({
  parentId: [{ required: true, message: "请选择父级分类", trigger: "blur" }],
  name: [{ required: true, message: "请输入分类名称", trigger: "blur" }],
  sortOrder: [{ required: true, message: "请输入排序", trigger: "blur" }],
  isActive: [{ required: true, message: "请选择状态", trigger: "change" }],
});

// 选择表格的行分类ID
const selectedCategoryId = ref<string | undefined>();

// 查询分类
function handleQuery() {
  loading.value = true;
  CategoryAPI.getList(queryParams)
    .then((data) => {
      categoryTableData.value = data;
    })
    .finally(() => {
      loading.value = false;
    });
}

// 重置查询
function handleResetQuery() {
  queryFormRef.value.resetFields();
  handleQuery();
}

// 行点击事件
function handleRowClick(row: CategoryVO) {
  selectedCategoryId.value = row.id?.toString();
}

/**
 * 打开表单弹窗
 *
 * @param parentId 父分类ID
 * @param categoryId 分类ID
 */
function handleOpenDialog(parentId?: number, categoryId?: number) {
  CategoryAPI.getOptions(true)
    .then((data) => {
      categoryOptions.value = [{ value: 0, label: "顶级分类", children: data }];
    })
    .then(() => {
      dialog.visible = true;
      if (categoryId) {
        dialog.title = "编辑分类";
        CategoryAPI.getFormData(categoryId).then((data) => {
          initialCategoryFormData.value = { ...data };
          formData.value = data;
        });
      } else {
        dialog.title = "新增分类";
        formData.value.parentId = parentId;
      }
    });
}

/**
 * 提交表单
 */
function handleSubmit() {
  categoryFormRef.value.validate((isValid: boolean) => {
    if (isValid) {
      const categoryId = formData.value.id;
      if (categoryId) {
        //修改时父级分类不能为当前分类
        if (formData.value.parentId == categoryId) {
          ElMessage.error("父级分类不能为当前分类");
          return;
        }
        CategoryAPI.update(categoryId.toString(), formData.value).then(() => {
          ElMessage.success("修改成功");
          handleCloseDialog();
          handleQuery();
        });
      } else {
        CategoryAPI.create(formData.value).then(() => {
          ElMessage.success("新增成功");
          handleCloseDialog();
          handleQuery();
        });
      }
    }
  });
}

// 删除分类
function handleDelete(categoryId: string) {
  if (!categoryId) {
    ElMessage.warning("请勾选删除项");
    return false;
  }

  ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      loading.value = true;
      CategoryAPI.deleteByIds(categoryId)
        .then(() => {
          ElMessage.success("删除成功");
          handleQuery();
        })
        .finally(() => {
          loading.value = false;
        });
    },
    () => {
      ElMessage.info("已取消删除");
    }
  );
}

function resetForm() {
  categoryFormRef.value.resetFields();
  categoryFormRef.value.clearValidate();
  formData.value = {
    id: undefined,
    parentId: 0,
    name: "",
    sortOrder: 1,
    isActive: 1,
    description: "",
  };
}

// 关闭弹窗
function handleCloseDialog() {
  dialog.visible = false;
  resetForm();
}

onMounted(() => {
  handleQuery();
});
</script>
