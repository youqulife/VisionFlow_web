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
defineOptions({ name: "Category" });

import CategoryAPI, { CategoryForm, CategoryPageQuery } from "@/api/product/category-api";
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
  permPrefix: "product:category",
  formItems: [],
});

// 列表配置
const contentConfig: IContentConfig<CategoryPageQuery> = reactive({
  // 权限前缀
  permPrefix: "product:category",
  table: {
    border: true,
    highlightCurrentRow: true,
  },
  // 主键
  pk: "id",
  // 列表查询接口
  indexAction: CategoryAPI.getPage,
  // 删除接口
  deleteAction: CategoryAPI.deleteByIds,
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
    { label: "分类名称", prop: "name" },
    { label: "父级分类ID：用于支持多级分类，NULL表示顶级分类", prop: "parentId" },
    { label: "排序号：数字越小排序越前", prop: "sortOrder" },
    { label: "分类描述", prop: "description" },
    { label: "是否启用：0-禁用, 1-启用", prop: "isActive" },
    { label: "记录创建时间", prop: "createTime" },
    { label: "记录最后更新时间", prop: "updateTime" },
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
const addModalConfig: IModalConfig<CategoryForm> = reactive({
  // 权限前缀
  permPrefix: "product:category",
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
        placeholder: "分类名称",
      },
      rules: [{ required: true, message: "分类名称不能为空", trigger: "blur" }],
      label: "分类名称",
      prop: "name",
    },
    {
      type: "input",
      attrs: {
        placeholder: "父级分类ID：用于支持多级分类，NULL表示顶级分类",
      },
      label: "父级分类ID：用于支持多级分类，NULL表示顶级分类",
      prop: "parentId",
    },
    {
      type: "input",
      attrs: {
        placeholder: "排序号：数字越小排序越前",
      },
      rules: [{ required: true, message: "排序号：数字越小排序越前不能为空", trigger: "blur" }],
      label: "排序号：数字越小排序越前",
      prop: "sortOrder",
    },
    {
      type: "input",
      attrs: {
        placeholder: "分类描述",
      },
      label: "分类描述",
      prop: "description",
    },
    {
      type: "input",
      attrs: {
        placeholder: "是否启用：0-禁用, 1-启用",
      },
      rules: [{ required: true, message: "是否启用：0-禁用, 1-启用不能为空", trigger: "blur" }],
      label: "是否启用：0-禁用, 1-启用",
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
  formAction: (data: CategoryForm) => {
    if (data.id) {
      // 编辑
      return CategoryAPI.update(data.id as string, data);
    } else {
      // 新增
      return CategoryAPI.create(data);
    }
  },
});

// 编辑配置
const editModalConfig: IModalConfig<CategoryForm> = reactive({
  permPrefix: "product:category",
  component: "drawer",
  drawer: {
    title: "编辑",
    size: 500,
  },
  pk: "id",
  formAction(data: any) {
    return CategoryAPI.update(data.id as string, data);
  },
  formItems: addModalConfig.formItems, // 复用新增的表单项
});

// 处理操作按钮点击
const handleOperateClick = (data: IObject) => {
  if (data.name === "edit") {
    handleEditClick(data.row, async () => {
      return await CategoryAPI.getFormData(data.row.id);
    });
  }
};

// 处理工具栏按钮点击（删除等）
const handleToolbarClick = (name: string) => {
  console.log(name);
};
</script>
