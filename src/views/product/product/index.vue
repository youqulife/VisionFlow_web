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
        row-key="id"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="expand">
          <template #default="props">
            <div class="expand-content">
              <!-- 商品属性 -->
              <el-card shadow="never" class="mb-15px">
                <template #header>
                  <div class="flex items-center">
                    <span>商品属性</span>
                  </div>
                </template>

                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-descriptions :column="1" size="small">
                      <el-descriptions-item label="产品类型">
                        {{ props.row.attribute?.productType || "-" }}
                      </el-descriptions-item>
                      <el-descriptions-item label="镜框样式">
                        {{ props.row.attribute?.frameStyle || "-" }}
                      </el-descriptions-item>
                    </el-descriptions>
                  </el-col>
                  <el-col :span="8">
                    <el-descriptions :column="1" size="small">
                      <el-descriptions-item label="镜框形状">
                        {{ props.row.attribute?.frameShape || "-" }}
                      </el-descriptions-item>
                      <el-descriptions-item label="铰链类型">
                        {{ props.row.attribute?.hingeType || "-" }}
                      </el-descriptions-item>
                    </el-descriptions>
                  </el-col>
                  <el-col :span="8">
                    <el-descriptions :column="1" size="small">
                      <el-descriptions-item label="材料类型">
                        <el-tag
                          v-for="material in props.row.attribute?.materialTypes"
                          :key="material"
                          class="mr-1"
                        >
                          {{ material }}
                        </el-tag>
                        <span
                          v-if="
                            !props.row.attribute?.materialTypes ||
                            props.row.attribute?.materialTypes.length === 0
                          "
                        >
                          -
                        </span>
                      </el-descriptions-item>
                    </el-descriptions>
                  </el-col>
                </el-row>
              </el-card>

              <!-- SKU信息 -->
              <el-card shadow="never">
                <template #header>
                  <div class="flex items-center">
                    <span>SKU列表 ({{ props.row.skus ? props.row.skus.length : 0 }})</span>
                  </div>
                </template>

                <el-table :data="props.row.skus" border style="width: 100%">
                  <el-table-column label="SKU编码" prop="skuCode" width="150" align="center" />
                  <el-table-column label="颜色" width="120" align="center">
                    <template #default="scope">
                      {{ scope.row.skuAttributes?.color?.name || "-" }}
                    </template>
                  </el-table-column>
                  <el-table-column label="尺寸" width="150" align="center">
                    <template #default="scope">
                      {{ scope.row.skuAttributes?.size?.display || "-" }}
                    </template>
                  </el-table-column>
                  <el-table-column label="进货价" width="120" align="center">
                    <template #default="scope">¥{{ scope.row.purchasePrice }}</template>
                  </el-table-column>
                  <el-table-column label="销售价" width="120" align="center">
                    <template #default="scope">¥{{ scope.row.salePrice }}</template>
                  </el-table-column>
                  <el-table-column label="库存" prop="stockQuantity" width="120" align="center" />
                  <el-table-column
                    label="库存预警"
                    prop="minStockAlert"
                    width="120"
                    align="center"
                  />
                  <el-table-column label="状态" width="100" align="center">
                    <template #default="scope">
                      <el-tag :type="scope.row.isActive ? 'success' : 'info'">
                        {{ scope.row.isActive ? "启用" : "禁用" }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="80" align="center">
                    <template #default="scope">
                      <el-button
                        type="danger"
                        link
                        size="small"
                        @click="handleDeleteSku(scope.row.id)"
                      >
                        删除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
            </div>
          </template>
        </el-table-column>
        <el-table-column key="id" label="ID" prop="id" min-width="100" align="center" />
        <el-table-column
          key="productCode"
          label="商品编码"
          prop="productCode"
          min-width="150"
          align="center"
        />
        <el-table-column key="name" label="商品名称" prop="name" min-width="150" align="center" />
        <el-table-column
          key="categoryName"
          label="商品分类"
          prop="categoryName"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="brandName"
          label="品牌"
          prop="brandName"
          min-width="120"
          align="center"
        />
        <el-table-column key="model" label="型号" prop="model" min-width="120" align="center" />
        <el-table-column key="skuCount" label="SKU数量" min-width="100" align="center">
          <template #default="scope">
            {{ scope.row.skus ? scope.row.skus.length : 0 }}
          </template>
        </el-table-column>
        <el-table-column key="isActive" label="状态" min-width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.isActive ? 'success' : 'info'">
              {{ scope.row.isActive ? "上架" : "下架" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          key="createTime"
          label="创建时间"
          prop="createTime"
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
      <el-form
        ref="dataFormRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        :disabled="loading"
      >
        <el-input v-model="formData.id" type="hidden" />
        <el-input v-model="formData.tenantId" type="hidden" />

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="品牌" prop="brandId">
              <el-select v-model="formData.brandId" placeholder="请选择品牌" clearable filterable>
                <el-option
                  v-for="brand in brandOptions"
                  :key="brand.value"
                  :label="brand.label"
                  :value="brand.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
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
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品名称" prop="name">
              <el-input v-model="formData.name" placeholder="商品名称：展示给客户的名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品编码" prop="productCode">
              <el-input v-model="formData.productCode" placeholder="商品编码：唯一库存单位编码" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="型号" prop="model">
          <el-input v-model="formData.model" placeholder="型号：商品具体型号" />
        </el-form-item>

        <el-form-item label="商品属性">
          <el-card shadow="never" class="mb-15px">
            <template #header>
              <div class="flex items-center justify-between">
                <span>商品属性</span>
              </div>
            </template>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="产品类型" prop="attribute.productType">
                  <el-input v-model="formData.attribute.productType" placeholder="产品类型" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="镜框样式" prop="attribute.frameStyle">
                  <el-input v-model="formData.attribute.frameStyle" placeholder="镜框样式" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20" class="mt-15px">
              <el-col :span="12">
                <el-form-item label="镜框形状" prop="attribute.frameShape">
                  <el-input v-model="formData.attribute.frameShape" placeholder="镜框形状" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="铰链类型" prop="attribute.hingeType">
                  <el-input v-model="formData.attribute.hingeType" placeholder="铰链类型" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="材料类型" prop="attribute.materialTypes" class="mt-15px">
              <el-select
                v-model="formData.attribute.materialTypes"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="请选择或输入材料类型"
              >
                <el-option label="金属" value="金属" />
                <el-option label="塑料" value="塑料" />
                <el-option label="钛合金" value="钛合金" />
                <el-option label="板材" value="板材" />
              </el-select>
            </el-form-item>
          </el-card>
        </el-form-item>

        <el-form-item label="SKU">
          <el-card shadow="never">
            <template #header>
              <div class="flex items-center justify-between">
                <span>SKU列表</span>
                <el-button type="primary" @click="handleAddSku">添加SKU</el-button>
              </div>
            </template>

            <el-table :data="formData.skus" border>
              <el-table-column label="SKU编码" width="150">
                <template #default="scope">
                  <el-input v-model="scope.row.skuCode" placeholder="SKU编码" size="small" />
                </template>
              </el-table-column>

              <el-table-column label="颜色" width="120">
                <template #default="scope">
                  <el-input
                    v-model="scope.row.skuAttributes.color.name"
                    placeholder="颜色"
                    size="small"
                  />
                </template>
              </el-table-column>

              <el-table-column label="尺寸" width="150">
                <template #default="scope">
                  <el-input
                    v-model="scope.row.skuAttributes.size.display"
                    placeholder="尺寸"
                    size="small"
                  />
                </template>
              </el-table-column>

              <el-table-column label="进货价" width="120">
                <template #default="scope">
                  <span>¥</span>
                  <el-input-number
                    v-model="scope.row.purchasePrice"
                    size="small"
                    :min="0"
                    controls-position="right"
                    style="width: 90%"
                  />
                </template>
              </el-table-column>

              <el-table-column label="销售价" width="120">
                <template #default="scope">
                  <span>¥</span>
                  <el-input-number
                    v-model="scope.row.salePrice"
                    size="small"
                    :min="0"
                    controls-position="right"
                    style="width: 90%"
                  />
                </template>
              </el-table-column>

              <el-table-column label="库存" width="100">
                <template #default="scope">
                  <el-input-number
                    v-model="scope.row.stockQuantity"
                    size="small"
                    :min="0"
                    controls-position="right"
                    style="width: 100%"
                  />
                </template>
              </el-table-column>

              <el-table-column label="库存预警" width="100">
                <template #default="scope">
                  <el-input-number
                    v-model="scope.row.minStockAlert"
                    size="small"
                    :min="0"
                    controls-position="right"
                    style="width: 100%"
                  />
                </template>
              </el-table-column>

              <el-table-column label="状态" width="80" align="center">
                <template #default="scope">
                  <el-switch
                    v-model="scope.row.isActive"
                    :active-value="1"
                    :inactive-value="0"
                    size="small"
                  />
                </template>
              </el-table-column>

              <el-table-column label="操作" width="80" align="center">
                <template #default="scope">
                  <el-button
                    type="danger"
                    link
                    icon="delete"
                    size="small"
                    @click="handleRemoveSku(scope.$index)"
                  />
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-form-item>

        <el-form-item label="上架状态" prop="isActive">
          <el-switch v-model="formData.isActive" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseDialog()">取消</el-button>
          <el-button type="primary" :loading="loading" @click="handleSubmit()">确定</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import ProductSkuAPI from "@/api/product/product-sku-api";

defineOptions({
  name: "Product",
  inheritAttrs: false,
});

import ProductAPI, {
  ProductPageVO,
  ProductForm,
  ProductPageQuery,
  ProductSkuForm,
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
const formData = reactive<ProductForm>({
  skus: [createEmptySku()],
  attribute: {},
});

// 商品分类选项
const categoryOptions = ref<OptionType[]>([]);

// 品牌选项
const brandOptions = ref<OptionType[]>([]);

// 抽屉宽度
const drawerSize = computed(() => (appStore.device === DeviceEnum.DESKTOP ? "800px" : "90%"));

// 商品信息表单校验规则
const rules = reactive({
  name: [{ required: true, message: "请输入商品名称", trigger: "blur" }],
  categoryId: [{ required: true, message: "请选择商品分类", trigger: "blur" }],
  brandId: [{ required: true, message: "请选择品牌", trigger: "blur" }],
  productCode: [{ required: true, message: "请输入商品编码", trigger: "blur" }],
});

/** 创建空的SKU对象 */
function createEmptySku(): ProductSkuForm {
  return {
    skuCode: "",
    skuAttributes: {
      color: {},
      size: {},
      specificAttributes: {},
    },
    stockQuantity: 0,
    purchasePrice: 0,
    salePrice: 0,
    minStockAlert: 0,
    isActive: 1,
  };
}

/** 添加SKU */
function handleAddSku() {
  if (!formData.skus) {
    formData.skus = [];
  }
  formData.skus.push(createEmptySku());
}

/** 删除SKU */
function handleRemoveSku(index: number) {
  if (formData.skus && formData.skus.length > 1) {
    formData.skus.splice(index, 1);
  } else {
    ElMessage.warning("至少保留一个SKU");
  }
}

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
      // 确保skus和attribute存在
      if (!data.skus || data.skus.length === 0) {
        data.skus = [createEmptySku()];
      }
      if (!data.attribute) {
        data.attribute = {};
      }
      Object.assign(formData, data);
    });
  } else {
    dialog.title = "新增商品信息";
    // 重置表单
    Object.assign(formData, {
      skus: [createEmptySku()],
      attribute: {},
      isActive: 1,
    });
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
  formData.tenantId = undefined;
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

/** 删除SKU */
function handleDeleteSku(id: number) {
  ElMessageBox.confirm("确认删除该SKU?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      ProductSkuAPI.deleteByIds(String(id)).then(() => {
        ElMessage.success("删除成功");
        // 重新加载数据
        handleQuery();
      });
    })
    .catch(() => {
      ElMessage.info("已取消删除");
    });
}

onMounted(() => {
  handleQuery();
  loadCategoryOptions();
  loadBrandOptions();
});
</script>

<style scoped>
.mb-15px {
  margin-bottom: 15px;
}

.mt-15px {
  margin-top: 15px;
}

.expand-content {
  padding: 10px 40px;
}

.mr-1 {
  margin-right: 4px;
  margin-bottom: 4px;
}
</style>
