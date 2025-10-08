<template>
  <div class="sku-select">
    <el-select
      v-model="selectedSKU"
      :placeholder="placeholder"
      :disabled="disabled || !skus || skus.length === 0"
      clearable
      style="width: 100%"
      @change="handleChange"
    >
      <el-option v-for="sku in skus" :key="sku.id" :label="formatSKU(sku)" :value="sku.skuCode">
        <div class="sku-option">
          <div class="sku-info">
            <span class="sku-code">{{ sku.skuCode }}</span>
            <span class="sku-attr">
              {{ formatSKU(sku) }}
            </span>
          </div>
        </div>
      </el-option>
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ProductSkuForm } from "@/api/product/product-api";

const props = defineProps<{
  skus?: ProductSkuForm[];
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string | undefined): void;
  (e: "change", sku?: ProductSkuForm): void;
}>();

const selectedSKU = ref<string | undefined>(props.modelValue);

// 监听外部值变化
watch(
  () => props.modelValue,
  (newVal) => {
    selectedSKU.value = newVal;
  }
);

// 监听SKU列表变化，如果当前选中的SKU不在新列表中，则清空选择
watch(
  () => props.skus,
  (newSkus) => {
    if (selectedSKU.value && newSkus) {
      const exists = newSkus.some((sku) => sku.skuCode === selectedSKU.value);
      if (!exists) {
        selectedSKU.value = undefined;
        emit("update:modelValue", undefined);
        emit("change", undefined);
      }
    }
  }
);

function formatSKU(sku: ProductSkuForm) {
  const attrs = [];

  if (sku.skuAttributes?.color?.name) {
    attrs.push(`颜色: ${sku.skuAttributes.color.name}`);
  }

  if (sku.skuAttributes?.size?.display) {
    attrs.push(`尺寸: ${sku.skuAttributes.size.display}`);
  }

  if (sku.skuAttributes?.material) {
    attrs.push(`材料: ${sku.skuAttributes.material}`);
  }

  return attrs.length > 0 ? attrs.join(", ") : "默认SKU";
}

function handleChange(value: string | undefined) {
  selectedSKU.value = value;
  emit("update:modelValue", value);

  if (value && props.skus) {
    const selected = props.skus.find((sku) => sku.skuCode === value);
    emit("change", selected);
  } else {
    emit("change", undefined);
  }
}
</script>

<style scoped>
.sku-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sku-info {
  display: flex;
  flex-direction: column;
}

.sku-code {
  margin-bottom: 2px;
  font-weight: bold;
}

.sku-attr {
  font-size: 12px;
  color: #999;
}
</style>
