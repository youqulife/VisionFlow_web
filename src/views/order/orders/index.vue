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
          v-hasPerm="['order:orders:add']"
          type="success"
          icon="plus"
          @click="handleOpenDialog()"
        >
          新增
        </el-button>
        <el-button
          v-hasPerm="['order:orders:delete']"
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
              <!-- 订单明细信息 -->
              <el-card shadow="never">
                <template #header>
                  <div class="flex items-center">
                    <span>订单明细 ({{ props.row.items ? props.row.items.length : 0 }})</span>
                  </div>
                </template>

                <el-table :data="props.row.items" border style="width: 100%">
                  <el-table-column label="商品名称" prop="productName" width="150" align="center" />
                  <el-table-column label="SKU编码" prop="skuCode" width="150" align="center" />
                  <el-table-column label="数量" prop="quantity" width="100" align="center" />
                  <el-table-column label="单价" width="120" align="center">
                    <template #default="scope">¥{{ scope.row.unitPrice }}</template>
                  </el-table-column>
                  <el-table-column label="小计" width="120" align="center">
                    <template #default="scope">¥{{ scope.row.subtotal }}</template>
                  </el-table-column>
                  <el-table-column label="折扣" width="100" align="center">
                    <template #default="scope">{{ scope.row.discount }}%</template>
                  </el-table-column>
                </el-table>
              </el-card>
            </div>
          </template>
        </el-table-column>
        <el-table-column key="id" label="订单ID" prop="id" min-width="150" align="center" />
        <el-table-column
          key="customerId"
          label="顾客ID"
          prop="customerId"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="eyeExamId"
          label="关联的验光记录ID"
          prop="eyeExamId"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="orderNumber"
          label="订单号"
          prop="orderNumber"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="orderType"
          label="订单类型"
          prop="orderType"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="totalAmount"
          label="订单总金额"
          prop="totalAmount"
          min-width="150"
          align="center"
        >
          <template #default="scope">¥{{ scope.row.totalAmount }}</template>
        </el-table-column>
        <el-table-column
          key="discountAmount"
          label="优惠金额"
          prop="discountAmount"
          min-width="150"
          align="center"
        >
          <template #default="scope">¥{{ scope.row.discountAmount }}</template>
        </el-table-column>
        <el-table-column
          key="finalAmount"
          label="实付金额"
          prop="finalAmount"
          min-width="150"
          align="center"
        >
          <template #default="scope">¥{{ scope.row.finalAmount }}</template>
        </el-table-column>
        <el-table-column key="status" label="状态" prop="status" min-width="150" align="center" />
        <el-table-column
          key="paymentMethod"
          label="支付方式"
          prop="paymentMethod"
          min-width="150"
          align="center"
        />
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
              v-hasPerm="['order:orders:edit']"
              type="primary"
              size="small"
              link
              icon="edit"
              @click="handleOpenDialog(scope.row.id)"
            >
              编辑
            </el-button>
            <el-button
              v-hasPerm="['order:orders:delete']"
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

    <!-- 订单表单弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="900px"
      @close="handleCloseDialog"
    >
      <el-form ref="dataFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-input v-model="formData.id" type="hidden" />
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="顾客" prop="customerId">
              <el-input v-model="formData.customerId" placeholder="顾客" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="验光记录" prop="eyeExamId">
              <el-input v-model="formData.eyeExamId" placeholder="关联的验光记录" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="订单号" prop="orderNumber">
              <el-input v-model="formData.orderNumber" placeholder="订单号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="订单类型" prop="orderType">
              <el-input v-model="formData.orderType" placeholder="订单类型" />
              <el-select
                v-model="formData.orderType"
                placeholder="请选择订单类型"
                style="width: 100%"
              >
                <el-option label="配镜套餐折扣" value="optical" />
                <el-option label="季节性折扣" value="sunglasses" />
                <el-option label="会员折扣" value="contact_lens" />
                <el-option label="满减活动" value="accessories" />
                <el-option label="免费或固定收费" value="service" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 订单明细 -->
        <el-divider content-position="left">订单明细</el-divider>
        <el-form-item>
          <el-button type="primary" @click="handleSelectProductForNew">添加商品</el-button>
        </el-form-item>

        <el-table :data="formData.items" border style="width: 100%">
          <el-table-column label="商品" prop="productName" width="200">
            <template #default="scope">
              <div v-if="scope.row.productId">
                {{ scope.row.productName }}
                <el-button link type="primary" @click="handleSelectProduct(scope.$index)">
                  更改
                </el-button>
              </div>
              <div v-else>
                <el-button link type="primary" @click="handleSelectProduct(scope.$index)">
                  选择商品
                </el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="SKU编码" prop="skuCode" width="180">
            <template #default="scope">
              <SKUSelect
                v-if="
                  scope.row.productId &&
                  scope.row.availableSkus &&
                  scope.row.availableSkus.length > 0
                "
                v-model="scope.row.skuCode"
                :skus="scope.row.availableSkus"
                placeholder="请选择SKU"
                @change="(sku) => handleSKUChange(scope.$index, sku)"
              />
              <span v-else-if="scope.row.skuCode">{{ scope.row.skuCode }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="数量" prop="quantity" width="100">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.quantity"
                :min="1"
                controls-position="right"
                style="width: 100%"
              />
            </template>
          </el-table-column>
          <el-table-column label="单价" width="120">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.unitPrice"
                :min="0"
                controls-position="right"
                style="width: 100%"
              />
            </template>
          </el-table-column>
          <el-table-column label="折扣率(%)" width="100">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.discountRate"
                :min="0"
                :max="100"
                controls-position="right"
                style="width: 100%"
                @change="(val) => handleDiscountRateChange(scope.$index, val)"
              />
            </template>
          </el-table-column>
          <el-table-column label="折扣金额" width="120">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.discountAmount"
                :min="0"
                controls-position="right"
                style="width: 100%"
                @change="(val) => handleDiscountAmountChange(scope.$index, val)"
              />
            </template>
          </el-table-column>
          <el-table-column label="小计" width="120">
            <template #default="scope">
              ¥{{
                (
                  (scope.row.quantity || 0) *
                  (scope.row.unitPrice || 0) *
                  (1 - (scope.row.discountRate || 0) / 100)
                ).toFixed(2)
              }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="scope">
              <el-button type="danger" size="small" @click="handleRemoveOrderItem(scope.$index)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-row :gutter="20" style="margin-top: 5px">
          <el-col :span="6">
            <el-form-item label="订单金额" prop="subtotal">
              <el-input-number
                v-model="formData.subtotal"
                placeholder="订单金额"
                :min="0"
                :controls="false"
                style="width: 100%"
                readonly
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="优惠金额" prop="discountAmount">
              <el-input-number
                v-model="formData.discountAmount"
                placeholder="优惠金额"
                :min="0"
                :controls="false"
                style="width: 100%"
                readonly
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="订单总计" prop="totalAmount">
              <el-input-number
                v-model="formData.totalAmount"
                placeholder="订单总计"
                :min="0"
                :controls="false"
                style="width: 100%"
                readonly
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="实付金额" prop="actualAmount">
              <el-input-number
                v-model="formData.actualAmount"
                placeholder="实付金额"
                :min="0"
                controls-position="right"
                style="width: 100%"
                @change="handleActualAmountChange"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="待支付" value="pending" />
                <el-option label="已支付" value="paid" />
                <el-option label="已发货" value="shipped" />
                <el-option label="已完成" value="completed" />
                <el-option label="已取消" value="cancelled" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="支付方式" prop="paymentMethod">
              <el-select
                v-model="formData.paymentMethod"
                placeholder="请选择支付方式"
                style="width: 100%"
              >
                <el-option label="微信支付" value="wechat" />
                <el-option label="支付宝" value="alipay" />
                <el-option label="银行卡" value="bankcard" />
                <el-option label="现金" value="cash" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="订单备注" prop="notes">
              <el-input v-model="formData.notes" type="textarea" placeholder="订单备注" :rows="3" />
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
    </el-dialog>

    <!-- 商品选择弹窗 -->
    <ProductTableSelect ref="productSelectRef" @selected="handleProductSelected" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import ProductTableSelect from "@/views/order/components/ProductTableSelect.vue";

defineOptions({
  name: "Orders",
  inheritAttrs: false,
});

import OrdersAPI, { OrdersPageVO, OrdersForm, OrdersPageQuery } from "@/api/order/orders-api";
import { OrderItemForm } from "@/api/order/order-item-api";
import { ProductPageVO } from "@/api/product/product-api";
import SKUSelect from "@/views/order/components/SKUSelect.vue";

const queryFormRef = ref();
const dataFormRef = ref();
const productSelectRef = ref();

const loading = ref(false);
const removeIds = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<OrdersPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

// 订单表格数据
const pageData = ref<OrdersPageVO[]>([]);

// 弹窗
const dialog = reactive({
  title: "",
  visible: false,
});

// 当前正在选择商品的订单项索引
const currentOrderItemIndex = ref<number>(-1);

// 订单表单数据
const formData = reactive<OrdersForm & { originalTotalAmount?: number }>({
  items: [],
  subtotal: 0, // 订单总金额
  totalAmount: 0, // 订单应付金额 = 订单总金额 - 优惠金额
  actualAmount: 0, // 实付金额
  originalTotalAmount: 0, // 保存原始总金额用于比较
});

// 订单表单校验规则
const rules = reactive({
  customerId: [{ required: true, message: "请输入顾客ID", trigger: "blur" }],
  orderNumber: [{ required: true, message: "请输入订单号", trigger: "blur" }],
});

// 监听订单明细变化，自动计算总金额
watch(
  () => formData.items,
  () => {
    calculateOrderAmounts();
  },
  { deep: true }
);

/** 计算订单金额 */
function calculateOrderAmounts() {
  if (!formData.items) return;

  let totalAmount = 0; // 订单金额（折扣前）
  let discountAmount = 0; // 优惠金额（所有商品折扣金额的总和）

  // 计算每个商品的小计和折扣金额
  formData.items.forEach((item) => {
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;
    const discountRate = item.discountRate || 0;
    const discountAmountItem = item.discountAmount || 0;

    // 商品原价总额
    const originalSubtotal = quantity * unitPrice;

    // 商品折扣后的金额（根据折扣率计算）
    const discountedSubtotal = originalSubtotal * (1 - discountRate / 100);

    // 商品折扣金额（可以来自折扣率或手动输入的折扣金额）
    const itemDiscount =
      discountAmountItem > 0 ? discountAmountItem : originalSubtotal - discountedSubtotal;

    // 累加到总金额
    totalAmount += originalSubtotal;
    discountAmount += itemDiscount;
  });

  formData.subtotal = parseFloat(totalAmount.toFixed(2));
  formData.discountAmount = parseFloat(discountAmount.toFixed(2));

  // 应付金额 = 订单金额 - 优惠金额
  formData.totalAmount = parseFloat((totalAmount - discountAmount).toFixed(2));

  // 实付金额默认等于应付金额，但如果用户已修改过实付金额，则保持用户设置的值
  // 只有在初始化或用户未手动修改过实付金额时才更新
  if (
    !formData.actualAmount ||
    formData.actualAmount === formData.originalTotalAmount ||
    formData.actualAmount === 0
  ) {
    formData.actualAmount = formData.totalAmount;
  }

  // 保存当前的总金额，用于下次比较
  formData.originalTotalAmount = formData.totalAmount;
}

/** 折扣率变更处理 */
function handleDiscountRateChange(index: number, value: number) {
  if (formData.items && formData.items[index]) {
    const item = formData.items[index];
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;

    // 根据折扣率自动计算折扣金额
    const originalSubtotal = quantity * unitPrice;
    item.discountAmount = parseFloat(((originalSubtotal * (value || 0)) / 100).toFixed(2));

    // 重新计算总金额
    calculateOrderAmounts();
  }
}

/** 折扣金额变更处理 */
function handleDiscountAmountChange(index: number, value: number) {
  if (formData.items && formData.items[index]) {
    const item = formData.items[index];
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;

    // 根据折扣金额反推折扣率
    const originalSubtotal = quantity * unitPrice;
    if (originalSubtotal > 0) {
      item.discountRate = parseFloat((((value || 0) / originalSubtotal) * 100).toFixed(2));
    } else {
      item.discountRate = 0;
    }

    // 重新计算总金额
    calculateOrderAmounts();
  }
}

/** 实付金额变更处理 */
function handleActualAmountChange() {
  // 实付金额变更时不需要特殊处理，保持独立可编辑
}

/** 查询订单 */
function handleQuery() {
  loading.value = true;
  OrdersAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

/** 重置订单查询 */
function handleResetQuery() {
  queryFormRef.value!.resetFields();
  queryParams.pageNum = 1;
  handleQuery();
}

/** 行复选框选中记录选中ID集合 */
function handleSelectionChange(selection: any) {
  removeIds.value = selection.map((item: any) => item.id);
}

/** 打开订单弹窗 */
function handleOpenDialog(id?: number) {
  dialog.visible = true;
  if (id) {
    dialog.title = "修改订单";
    OrdersAPI.getFormData(id).then((data) => {
      Object.assign(formData, data);
      // 确保items数组存在
      if (!formData.items) {
        formData.items = [];
      }
      // 计算金额
      calculateOrderAmounts();
    });
  } else {
    dialog.title = "新增订单";
    // 初始化订单明细数组
    formData.items = [];
  }
}

/** 删除订单明细 */
function handleRemoveOrderItem(index: number) {
  if (formData.items) {
    formData.items.splice(index, 1);
  }
}

/** 选择商品 */
function handleSelectProduct(index: number) {
  currentOrderItemIndex.value = index;
  productSelectRef.value?.show();
}

/** 选择商品（用于新增商品） */
function handleSelectProductForNew() {
  // 设置一个特殊值表示是新增商品
  currentOrderItemIndex.value = -1;
  productSelectRef.value?.show();
}

/** 商品选择确认 */
function handleProductSelected(products: ProductPageVO[]) {
  if (formData.items) {
    // 如果 currentOrderItemIndex 为 -1，表示是新增商品
    if (currentOrderItemIndex.value === -1) {
      // 为每个选中的商品添加新行
      products.forEach((product) => {
        const newOrderItem: OrderItemForm = {
          productId: product.id,
          productName: product.name,
          skuCode: "",
          quantity: 1,
          unitPrice: 0,
          discountRate: 0, // 添加折扣率字段
          discountAmount: 0, // 添加折扣金额字段
          availableSkus: product.skus || [],
        };

        // 如果只有一个SKU，自动选择
        if (product.skus && product.skus.length === 1) {
          newOrderItem.skuCode = product.skus[0].skuCode;
          newOrderItem.unitPrice = product.skus[0].salePrice || 0;
        }

        formData.items!.push(newOrderItem);
      });
    }
    // 否则是修改现有商品
    else if (currentOrderItemIndex.value >= 0) {
      // 如果返回的是数组（多选），则为每个商品创建一个订单项
      products.forEach((product, index) => {
        // 第一个商品替换当前行，其他商品添加新行
        if (index === 0) {
          const orderItem = formData.items![currentOrderItemIndex.value];
          orderItem.productId = product.id;
          orderItem.productName = product.name;

          // 保存可用的SKU列表
          orderItem.availableSkus = product.skus || [];

          // 如果只有一个SKU，自动选择
          if (product.skus && product.skus.length === 1) {
            orderItem.skuCode = product.skus[0].skuCode;
            handleSKUChange(currentOrderItemIndex.value, product.skus[0]);
          } else {
            // 清空SKU相关字段
            orderItem.skuCode = "";
            orderItem.unitPrice = 0;
          }
        } else {
          // 为后续商品添加新行
          const newOrderItem: OrderItemForm = {
            productId: product.id,
            productName: product.name,
            skuCode: "",
            quantity: 1,
            unitPrice: 0,
            discountRate: 0, // 添加折扣率字段
            discountAmount: 0, // 添加折扣金额字段
            availableSkus: product.skus || [],
          };

          // 如果只有一个SKU，自动选择
          if (product.skus && product.skus.length === 1) {
            newOrderItem.skuCode = product.skus[0].skuCode;
            newOrderItem.unitPrice = product.skus[0].salePrice || 0;
          }

          formData.items!.push(newOrderItem);
        }
      });
    }
  }
  currentOrderItemIndex.value = -1;
}

/** SKU变更 */
function handleSKUChange(index: number, sku: any) {
  if (formData.items && sku) {
    const orderItem = formData.items[index];
    orderItem.unitPrice = sku.salePrice || 0;
  }
}

/** 提交订单表单 */
function handleSubmit() {
  dataFormRef.value.validate((valid: any) => {
    if (valid) {
      loading.value = true;
      const id = formData.id;
      if (id) {
        OrdersAPI.update(id.toString(), formData)
          .then(() => {
            ElMessage.success("修改成功");
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        OrdersAPI.create(formData)
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

/** 关闭订单弹窗 */
function handleCloseDialog() {
  dialog.visible = false;
  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();
  formData.id = undefined;
  formData.items = [];
  formData.originalTotalAmount = undefined;
}

/** 删除订单 */
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
      OrdersAPI.deleteByIds(ids)
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

<style scoped>
.expand-content {
  padding: 10px 40px;
}

/* 订单金额汇总 */
.order-amount {
  font-size: 16px;
  font-weight: bold;
}
</style>
