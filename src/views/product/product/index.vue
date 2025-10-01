<template>
  <div class="app-container h-full flex flex-1 flex-col">
    <!-- 搜索 -->
    <page-search
      ref="searchRef"
      :search-config="searchConfig"
      @query-click="handleQueryClick"
      @reset-click="handleResetClick"
    ></page-search>

    <!-- 列表 -->
    <page-content
      ref="contentRef"
      :content-config="contentConfig"
      @add-click="handleAddClick"
      @export-click="handleExportClick"
      @search-click="handleSearchClick"
      @toolbar-click="handleToolbarClick"
      @operate-click="handleOperateClick"
      @filter-change="handleFilterChange"
    ></page-content>

    <!-- 新增 -->
    <page-modal
      ref="addModalRef"
      :modal-config="addModalConfig"
      @submit-click="handleSubmitClick"
    ></page-modal>

    <!-- 编辑 -->
    <page-modal
      ref="editModalRef"
      :modal-config="editModalConfig"
      @submit-click="handleSubmitClick"
    ></page-modal>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "Product" });

import ProductAPI, { ProductForm, ProductPageQuery } from "@/api/product/product-api";
import type { IObject, IModalConfig, IContentConfig, ISearchConfig } from "@/components/CURD/types";
import usePage from "@/components/CURD/usePage";

// 组合式 CRUD
const {
  searchRef,
  contentRef,
  addModalRef,
  editModalRef,
  handleQueryClick,
  handleResetClick,
  handleAddClick,
  handleEditClick,
  handleSubmitClick,
  handleExportClick,
  handleSearchClick,
  handleFilterChange,
} = usePage();

// 搜索配置
const searchConfig: ISearchConfig = reactive({
  permPrefix: "product:product",
  formItems: [],
});

// 列表配置
const contentConfig: IContentConfig<ProductPageQuery> = reactive({
  // 权限前缀
  permPrefix: "product:product",
  table: {
    border: true,
    highlightCurrentRow: true,
  },
  // 主键
  pk: "id",
  // 列表查询接口
  indexAction: ProductAPI.getPage,
  // 删除接口
  deleteAction: ProductAPI.deleteByIds,
  // 数据解析函数
  parseData(res: any) {
    return {
      total: res.total,
      list: res.list,
    };
  },
  // 分页配置
  pagination: {
    background: true,
    layout: "total, sizes, prev, pager, next, jumper",
    pageSize: 20,
    pageSizes: [10, 20, 30, 50],
  },
  // 工具栏配置
  toolbar: ["add", "delete"],
  defaultToolbar: ["refresh", "filter"],
  // 表格列配置
  cols: [
    { type: "selection", width: 55, align: "center" },
    { label: "主键ID", prop: "id" },
    { label: "租户ID", prop: "tenantId" },
    { label: "商品名称：展示给客户的名称", prop: "name" },
    { label: "商品SKU编码：唯一库存单位编码", prop: "sku" },
    { label: "商品分类ID：关联categories表", prop: "categoryId" },
    { label: "品牌名称：如'依视路', '蔡司', '雷朋'等", prop: "brand" },
    { label: "型号：商品具体型号", prop: "model" },
    { label: "折射率：如1.56, 1.60, 1.67, 1.74等", prop: "refractiveIndex" },
    { label: "镜片功能：如'防蓝光', '变色', '渐进多焦点'等", prop: "lensFunction" },
    { label: "进货价格", prop: "purchasePrice" },
    { label: "销售价格", prop: "salePrice" },
    { label: "库存数量", prop: "stockQuantity" },
    { label: "最低库存预警线", prop: "minStockAlert" },
    { label: "是否上架：0-下架, 1-上架", prop: "isActive" },
    { label: "软删除标记：0-未删除, 1-已删除", prop: "isDeleted" },
    { label: "记录创建时间", prop: "createdAt" },
    { label: "记录最后更新时间", prop: "updatedAt" },
    {
      label: "操作",
      prop: "operation",
      width: 220,
      templet: "tool",
      operat: ["edit", "delete"],
    },
  ],
});

// 新增配置
const addModalConfig: IModalConfig<ProductForm> = reactive({
  // 权限前缀
  permPrefix: "product:product",
  // 主键
  pk: "id",
  // 弹窗配置
  dialog: {
    title: "新增",
    width: 800,
    draggable: true,
  },
  form: {
    labelWidth: 100,
  },
  // 表单项配置
  formItems: [
    {
      type: "input",
      attrs: {
        placeholder: "租户ID",
      },
      rules: [{ required: true, message: "租户ID不能为空", trigger: "blur" }],
      label: "租户ID",
      prop: "tenantId",
    },
    {
      type: "input",
      attrs: {
        placeholder: "商品名称：展示给客户的名称",
      },
      rules: [{ required: true, message: "商品名称：展示给客户的名称不能为空", trigger: "blur" }],
      label: "商品名称：展示给客户的名称",
      prop: "name",
    },
    {
      type: "input",
      attrs: {
        placeholder: "商品SKU编码：唯一库存单位编码",
      },
      label: "商品SKU编码：唯一库存单位编码",
      prop: "sku",
    },
    {
      type: "input",
      attrs: {
        placeholder: "商品分类ID：关联categories表",
      },
      rules: [{ required: true, message: "商品分类ID：关联categories表不能为空", trigger: "blur" }],
      label: "商品分类ID：关联categories表",
      prop: "categoryId",
    },
    {
      type: "input",
      attrs: {
        placeholder: "品牌名称：如'依视路', '蔡司', '雷朋'等",
      },
      label: "品牌名称：如'依视路', '蔡司', '雷朋'等",
      prop: "brand",
    },
    {
      type: "input",
      attrs: {
        placeholder: "型号：商品具体型号",
      },
      label: "型号：商品具体型号",
      prop: "model",
    },
    {
      type: "input",
      attrs: {
        placeholder: "折射率：如1.56, 1.60, 1.67, 1.74等",
      },
      label: "折射率：如1.56, 1.60, 1.67, 1.74等",
      prop: "refractiveIndex",
    },
    {
      type: "input",
      attrs: {
        placeholder: "镜片功能：如'防蓝光', '变色', '渐进多焦点'等",
      },
      label: "镜片功能：如'防蓝光', '变色', '渐进多焦点'等",
      prop: "lensFunction",
    },
    {
      type: "input",
      attrs: {
        placeholder: "进货价格",
      },
      rules: [{ required: true, message: "进货价格不能为空", trigger: "blur" }],
      label: "进货价格",
      prop: "purchasePrice",
    },
    {
      type: "input",
      attrs: {
        placeholder: "销售价格",
      },
      rules: [{ required: true, message: "销售价格不能为空", trigger: "blur" }],
      label: "销售价格",
      prop: "salePrice",
    },
    {
      type: "input",
      attrs: {
        placeholder: "库存数量",
      },
      rules: [{ required: true, message: "库存数量不能为空", trigger: "blur" }],
      label: "库存数量",
      prop: "stockQuantity",
    },
    {
      type: "input",
      attrs: {
        placeholder: "最低库存预警线",
      },
      rules: [{ required: true, message: "最低库存预警线不能为空", trigger: "blur" }],
      label: "最低库存预警线",
      prop: "minStockAlert",
    },
    {
      type: "input",
      attrs: {
        placeholder: "是否上架：0-下架, 1-上架",
      },
      rules: [{ required: true, message: "是否上架：0-下架, 1-上架不能为空", trigger: "blur" }],
      label: "是否上架：0-下架, 1-上架",
      prop: "isActive",
    },
    {
      type: "input",
      attrs: {
        placeholder: "软删除标记：0-未删除, 1-已删除",
      },
      rules: [
        { required: true, message: "软删除标记：0-未删除, 1-已删除不能为空", trigger: "blur" },
      ],
      label: "软删除标记：0-未删除, 1-已删除",
      prop: "isDeleted",
    },
  ],
  // 提交函数
  formAction: (data: ProductForm) => {
    if (data.id) {
      // 编辑
      return ProductAPI.update(data.id as string, data);
    } else {
      // 新增
      return ProductAPI.create(data);
    }
  },
});

// 编辑配置
const editModalConfig: IModalConfig<ProductForm> = reactive({
  permPrefix: "product:product",
  component: "drawer",
  drawer: {
    title: "编辑",
    size: 500,
  },
  pk: "id",
  formAction(data: any) {
    return ProductAPI.update(data.id as string, data);
  },
  formItems: addModalConfig.formItems, // 复用新增的表单项
});

// 处理操作按钮点击
const handleOperateClick = (data: IObject) => {
  if (data.name === "edit") {
    handleEditClick(data.row, async () => {
      return await ProductAPI.getFormData(data.row.id);
    });
  }
};

// 处理工具栏按钮点击（删除等）
const handleToolbarClick = (name: string) => {
  console.log(name);
};
</script>
