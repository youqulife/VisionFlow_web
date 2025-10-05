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
          v-hasPerm="['product:product:add']"
          type="success"
          icon="plus"
          @click="handleOpenDialog()"
        >
          新增
        </el-button>
        <el-button
          v-hasPerm="['product:product:delete']"
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
        <el-table-column key="id" label="ID" prop="id" min-width="150" align="center" />
        <el-table-column key="sku" label="商品SKU" prop="sku" min-width="150" align="center" />
        <el-table-column key="name" label="商品" prop="name" min-width="150" align="center" />
        <el-table-column
          key="categoryId"
          label="商品分类"
          prop="categoryId"
          min-width="150"
          align="center"
        >
          <template #default="scope">
            {{ getCategoryName(scope.row.categoryId) }}
          </template>
        </el-table-column>
        <el-table-column key="brand" label="品牌" prop="brand" min-width="150" align="center" />
        <el-table-column key="model" label="型号" prop="model" min-width="150" align="center" />
        <el-table-column
          key="refractiveIndex"
          label="折射率"
          prop="refractiveIndex"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="lensFunction"
          label="镜片功能"
          prop="lensFunction"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="purchasePrice"
          label="进货价格"
          prop="purchasePrice"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="salePrice"
          label="销售价格"
          prop="salePrice"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="stockQuantity"
          label="库存数量"
          prop="stockQuantity"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="minStockAlert"
          label="最低库存预警线"
          prop="minStockAlert"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="isActive"
          label="是否上架：0-下架, 1-上架"
          prop="isActive"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="createTime"
          label="记录创建时间"
          prop="createTime"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="updateTime"
          label="记录最后更新时间"
          prop="updateTime"
          min-width="150"
          align="center"
        />
        <el-table-column fixed="right" label="操作" width="220">
          <template #default="scope">
            <el-button
              v-hasPerm="['product:product:edit']"
              type="primary"
              size="small"
              link
              icon="edit"
              @click="handleOpenDialog(scope.row.id)"
            >
              编辑
            </el-button>
            <el-button
              v-hasPerm="['product:product:delete']"
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

    <!-- 商品信息表单弹窗 -->
    <el-drawer
      v-model="dialog.visible"
      :title="dialog.title"
      :size="drawerSize"
      @close="handleCloseDialog"
    >
      <el-form ref="dataFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-input v-model="formData.id" type="hidden" />

        <el-form-item label="品牌" prop="brand">
          <el-select v-model="formData.brandId" placeholder="请选择品牌" clearable filterable>
            <el-option
              v-for="brand in brandOptions"
              :key="brand.value"
              :label="brand.label"
              :value="brand.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商品分类" prop="categoryId">
          <el-tree-select
            v-model="formData.categoryId"
            placeholder="请选择商品分类"
            :data="categoryOptions"
            filterable
            check-strictly
            :render-after-expand="false"
          />
        </el-form-item>
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="formData.name" placeholder="商品名称：展示给客户的名称" />
        </el-form-item>
        <el-form-item label="商品SKU" prop="sku">
          <el-input v-model="formData.sku" placeholder="商品SKU编码：唯一库存单位编码" />
        </el-form-item>

        <el-form-item label="型号" prop="model">
          <el-input v-model="formData.model" placeholder="型号：商品具体型号" />
        </el-form-item>

        <el-form-item label="折射率" prop="refractiveIndex">
          <el-input-number
            v-model="formData.refractiveIndex"
            placeholder="折射率：如1.56, 1.60, 1.67, 1.74等"
          />
        </el-form-item>

        <el-form-item label="镜片功能" prop="lensFunction">
          <el-input
            v-model="formData.lensFunction"
            placeholder="镜片功能：如'防蓝光', '变色', '渐进多焦点'等"
          />
        </el-form-item>

        <el-form-item label="进货价格" prop="purchasePrice">
          <el-input-number v-model="formData.purchasePrice" placeholder="进货价格" />
        </el-form-item>

        <el-form-item label="销售价格" prop="salePrice">
          <el-input-number v-model="formData.salePrice" placeholder="销售价格" />
        </el-form-item>

        <el-form-item label="库存数量" prop="stockQuantity">
          <el-input-number v-model="formData.stockQuantity" placeholder="库存数量" />
        </el-form-item>

        <el-form-item label="最低库存预警线" prop="minStockAlert">
          <el-input-number v-model="formData.minStockAlert" placeholder="最低库存预警线" />
        </el-form-item>

        <el-form-item label="是否上架" prop="isActive">
          <el-switch v-model="formData.isActive" :active-value="1" :inactive-value="0" />
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
  name: "Product",
  inheritAttrs: false,
});

import ProductAPI, {
  ProductPageVO,
  ProductForm,
  ProductPageQuery,
} from "@/api/product/product-api";
import CategoryAPI from "@/api/product/category-api";
import BrandAPI from "@/api/product/brand-api";
import { DeviceEnum } from "@/enums/settings/device-enum";
import { useAppStore } from "@/store";

const queryFormRef = ref();
const dataFormRef = ref();
const appStore = useAppStore();

const loading = ref(false);
const removeIds = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<ProductPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

// 商品信息表格数据
const pageData = ref<ProductPageVO[]>([]);

// 弹窗
const dialog = reactive({
  title: "",
  visible: false,
});

// 商品信息表单数据
const formData = reactive<ProductForm>({});

// 商品分类选项
const categoryOptions = ref<OptionType[]>([]);

// 品牌选项
const brandOptions = ref<OptionType[]>([]);

// 抽屉宽度
const drawerSize = computed(() => (appStore.device === DeviceEnum.DESKTOP ? "600px" : "90%"));

// 商品信息表单校验规则
const rules = reactive({
  name: [{ required: true, message: "请输入商品名称", trigger: "blur" }],
  categoryId: [{ required: true, message: "请选择商品分类", trigger: "blur" }],
  brand: [{ required: true, message: "请选择品牌", trigger: "blur" }],
  purchasePrice: [{ required: true, message: "请输入进货价格", trigger: "blur" }],
  salePrice: [{ required: true, message: "请输入销售价格", trigger: "blur" }],
  stockQuantity: [{ required: true, message: "请输入库存数量", trigger: "blur" }],
  minStockAlert: [{ required: true, message: "请输入最低库存预警线", trigger: "blur" }],
});

// 获取分类名称
const getCategoryName = (categoryId: number) => {
  const findCategory = (categories: OptionType[]): string | undefined => {
    for (const category of categories) {
      if (category.value == categoryId) {
        return category.label;
      }
      if (category.children) {
        const found = findCategory(category.children);
        if (found) {
          return found;
        }
      }
    }
  };

  return findCategory(categoryOptions.value) || categoryId;
};

/** 查询商品信息 */
function handleQuery() {
  loading.value = true;
  ProductAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

// 获取商品分类选项
const loadCategoryOptions = () => {
  CategoryAPI.getOptions().then((data) => {
    categoryOptions.value = data;
  });
};

// 获取品牌选项 - 修改为直接获取分页数据并转换格式
const loadBrandOptions = () => {
  BrandAPI.getPage().then((response) => {
    brandOptions.value = response.list.map((item) => ({
      value: item.id,
      label: item.name,
    }));
  });
};

/** 重置商品信息查询 */
function handleResetQuery() {
  queryFormRef.value!.resetFields();
  queryParams.pageNum = 1;
  handleQuery();
}

/** 行复选框选中记录选中ID集合 */
function handleSelectionChange(selection: any) {
  removeIds.value = selection.map((item: any) => item.id);
}

/** 打开商品信息弹窗 */
function handleOpenDialog(id?: number) {
  dialog.visible = true;
  if (id) {
    dialog.title = "修改商品信息";
    ProductAPI.getFormData(id).then((data) => {
      Object.assign(formData, data);
    });
  } else {
    dialog.title = "新增商品信息";
  }
}

/** 提交商品信息表单 */
function handleSubmit() {
  dataFormRef.value.validate((valid: any) => {
    if (valid) {
      loading.value = true;
      const id = formData.id;
      if (id) {
        ProductAPI.update(String(id), formData)
          .then(() => {
            ElMessage.success("修改成功");
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        ProductAPI.create(formData)
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

/** 关闭商品信息弹窗 */
function handleCloseDialog() {
  dialog.visible = false;
  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();
  formData.id = undefined;
}

/** 删除商品信息 */
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
      ProductAPI.deleteByIds(ids)
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
  loadCategoryOptions();
  loadBrandOptions();
});
</script>
