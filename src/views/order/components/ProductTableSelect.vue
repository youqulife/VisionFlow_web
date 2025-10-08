<template>
  <div class="product-table-select">
    <el-dialog v-model="dialogVisible" :title="title" width="1000px" @close="handleClose">
      <el-row :gutter="20">
        <!-- 商品选择区域 -->
        <el-col :span="16">
          <div class="search-container mb-2">
            <el-form ref="queryFormRef" :model="queryParams" :inline="true">
              <el-form-item label="商品名称" prop="keywords">
                <el-input
                  v-model="queryParams.keywords"
                  placeholder="请输入商品名称"
                  clearable
                  @keyup.enter="handleQuery"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
                <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <el-table
            ref="tableRef"
            v-loading="loading"
            :data="productList"
            border
            height="400"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column type="index" label="#" width="50" align="center" />
            <el-table-column label="商品名称" prop="name" min-width="150" show-overflow-tooltip />
            <el-table-column label="商品编码" prop="productCode" min-width="120" />
            <el-table-column label="品牌" prop="brandName" min-width="100" />
            <el-table-column label="分类" prop="categoryName" min-width="100" />
            <el-table-column label="型号" prop="model" min-width="100" />
            <el-table-column label="状态" min-width="80" align="center">
              <template #default="scope">
                <el-tag v-if="scope.row.isActive === 1" type="success">上架</el-tag>
                <el-tag v-else type="info">下架</el-tag>
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-if="total > 0"
            v-model:total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="handleQuery"
          />
        </el-col>

        <!-- 已选商品区域 -->
        <el-col :span="8">
          <div class="selected-container">
            <div class="selected-header">
              <span>已选商品 ({{ selectedProducts.length }} 项)</span>
              <el-button
                type="danger"
                link
                size="small"
                :disabled="selectedProducts.length === 0"
                @click="handleClearAll"
              >
                清空
              </el-button>
            </div>
            <div class="selected-list">
              <el-table :data="selectedProducts" border max-height="435">
                <el-table-column type="index" label="#" width="50" align="center" />
                <el-table-column label="商品名称" prop="name" show-overflow-tooltip>
                  <template #default="scope">
                    <span class="product-name">{{ scope.row.name }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="80" align="center">
                  <template #default="scope">
                    <el-button
                      type="danger"
                      link
                      size="small"
                      @click="handleRemoveSelected(scope.$index)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-col>
      </el-row>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button
            type="primary"
            :disabled="selectedProducts.length === 0"
            @click="handleConfirm"
          >
            确 定 (已选 {{ selectedProducts.length }} 项)
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from "vue";
import ProductAPI, { ProductPageVO, ProductPageQuery } from "@/api/product/product-api";

const emit = defineEmits<{
  (e: "selected", products: ProductPageVO[]): void;
}>();

const dialogVisible = ref(false);
const loading = ref(false);
const total = ref(0);
const productList = ref<ProductPageVO[]>([]);

const queryFormRef = ref();
const tableRef = ref();

const title = ref("选择商品");

const queryParams = reactive<ProductPageQuery>({
  pageNum: 1,
  pageSize: 10,
  keywords: "",
});

const selectedProducts = ref<ProductPageVO[]>([]);

function show() {
  dialogVisible.value = true;
  handleQuery();
}

function hide() {
  dialogVisible.value = false;
}

function handleQuery() {
  loading.value = true;
  ProductAPI.getPage(queryParams)
    .then((data) => {
      productList.value = data.list;
      total.value = data.total;
      // 更新已选商品在表格中的选中状态
      updateTableSelection();
    })
    .finally(() => {
      loading.value = false;
    });
}

function updateTableSelection() {
  // 在下次 DOM 更新后执行
  nextTick(() => {
    // 清除当前选中
    tableRef.value?.clearSelection();
    // 重新选中已选商品
    selectedProducts.value.forEach((product) => {
      const row = productList.value.find((item) => item.id === product.id);
      if (row) {
        tableRef.value?.toggleRowSelection(row, true);
      }
    });
  });
}

function handleResetQuery() {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  handleQuery();
}

function handleSelectionChange(selection: ProductPageVO[]) {
  // 合并已选商品和新选中的商品，去重
  const newSelected = [...selectedProducts.value];

  // 添加新选中的商品（避免重复）
  selection.forEach((item) => {
    if (!newSelected.some((selected) => selected.id === item.id)) {
      newSelected.push(item);
    }
  });

  selectedProducts.value = newSelected;
}

function handleRemoveSelected(index: number) {
  // 从已选列表中移除
  const removedProduct = selectedProducts.value.splice(index, 1)[0];

  // 同步更新表格中的选中状态
  const row = productList.value.find((item) => item.id === removedProduct.id);
  if (row) {
    tableRef.value?.toggleRowSelection(row, false);
  }
}

function handleClearAll() {
  // 清空已选列表
  selectedProducts.value = [];

  // 清除表格中的所有选中状态
  tableRef.value?.clearSelection();
}

function handleClose() {
  dialogVisible.value = false;
  selectedProducts.value = [];
}

function handleConfirm() {
  if (selectedProducts.value.length === 0) {
    ElMessage.warning("请先选择商品");
    return;
  }
  emit("selected", selectedProducts.value);
  handleClose();
}

defineExpose({
  show,
  hide,
});
</script>

<style scoped>
.search-container {
  padding: 0 10px;
}

.selected-container {
  display: flex;
  flex-direction: column;
  height: 500px;
}

.selected-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background-color: #f5f7fa;
  border: 1px solid #ebeef5;
  border-bottom: none;
}

.selected-list {
  flex: 1;
  overflow: auto;
}

.product-name {
  font-size: 12px;
}
</style>
