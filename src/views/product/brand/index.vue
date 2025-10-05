<template>
  <div class="app-container">
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="品牌名称" prop="name">
          <el-input v-model="queryParams.name" placeholder="请输入品牌名称" />
        </el-form-item>
        <el-form-item label="品牌分类" prop="category">
          <el-input v-model="queryParams.category" placeholder="请输入品牌分类" />
        </el-form-item>
        <el-form-item label="是否热门" prop="isPopular">
          <el-select v-model="queryParams.isPopular" placeholder="请选择是否热门" clearable>
            <el-option label="是" :value="1" />
            <el-option label="否" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
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
        <el-table-column key="id" label="品牌ID" prop="id" min-width="100" align="center" />
        <el-table-column key="name" label="品牌名称" prop="name" min-width="120" align="center" />
        <el-table-column
          key="englishName"
          label="英文名称"
          prop="englishName"
          min-width="120"
          align="center"
        />
        <el-table-column
          key="originCountry"
          label="原产国"
          prop="originCountry"
          min-width="100"
          align="center"
        />
        <el-table-column
          key="category"
          label="品牌分类"
          prop="category"
          min-width="100"
          align="center"
        />
        <el-table-column
          key="priceLevel"
          label="价格等级"
          prop="priceLevel"
          min-width="100"
          align="center"
        />
        <el-table-column
          key="logoUrl"
          label="品牌Logo"
          prop="logoUrl"
          min-width="150"
          align="center"
        >
          <template #default="scope">
            <el-image
              v-if="scope.row.logoUrl"
              :src="scope.row.logoUrl"
              :preview-src-list="[scope.row.logoUrl]"
              preview-teleported
              fit="cover"
              class="w-8 h-8"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          key="isPopular"
          label="是否热门"
          prop="isPopular"
          min-width="80"
          align="center"
        >
          <template #default="scope">
            <el-tag v-if="scope.row.isPopular === 1" type="success">是</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </template>
        </el-table-column>
        <el-table-column key="status" label="状态" prop="status" min-width="80" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 1" type="success">启用</el-tag>
            <el-tag v-else type="info">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          key="sortOrder"
          label="排序"
          prop="sortOrder"
          min-width="80"
          align="center"
        />
        <el-table-column
          key="description"
          label="品牌描述"
          prop="description"
          min-width="200"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          key="createTime"
          label="创建时间"
          prop="createTime"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="updateTime"
          label="更新时间"
          prop="updateTime"
          min-width="150"
          align="center"
        />
        <el-table-column fixed="right" label="操作" width="150">
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

        <el-row :gutter="15">
          <el-col :span="12">
            <el-form-item label="品牌名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入品牌名称" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="英文名称" prop="englishName">
              <el-input v-model="formData.englishName" placeholder="请输入英文名称" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="15">
          <el-col :span="12">
            <el-form-item label="原产国" prop="originCountry">
              <el-input v-model="formData.originCountry" placeholder="请输入原产国" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="品牌分类" prop="category">
              <el-input v-model="formData.category" placeholder="请输入品牌分类" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="15">
          <el-col :span="12">
            <el-form-item label="价格等级" prop="priceLevel">
              <el-select
                v-model="formData.priceLevel"
                placeholder="请选择价格等级"
                clearable
                style="width: 100%"
              >
                <el-option label="奢华" value="luxury" />
                <el-option label="高端" value="premium" />
                <el-option label="中端" value="mid-range" />
                <el-option label="经济" value="economic" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="排序" prop="sortOrder">
              <el-input-number
                v-model="formData.sortOrder"
                controls-position="right"
                :min="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="品牌Logo" prop="logoUrl">
          <el-input v-model="formData.logoUrl" placeholder="请输入品牌Logo URL" />
        </el-form-item>

        <el-form-item label="品牌描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入品牌描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-row :gutter="15">
          <el-col :span="12">
            <el-form-item label="是否热门" prop="isPopular">
              <el-switch
                v-model="formData.isPopular"
                :active-value="1"
                :inactive-value="0"
                active-text="是"
                inactive-text="否"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-switch
                v-model="formData.status"
                :active-value="1"
                :inactive-value="0"
                active-text="启用"
                inactive-text="禁用"
              />
            </el-form-item>
          </el-col>
        </el-row>
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
  name: [{ required: true, message: "请输入品牌名称", trigger: "blur" }],
  category: [{ required: true, message: "请输入品牌分类", trigger: "blur" }],
  status: [{ required: true, message: "请选择状态", trigger: "blur" }],
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
        BrandAPI.update(id.toString(), formData)
          .then(() => {
            ElMessage.success("修改成功");
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        BrandAPI.create(formData)
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
