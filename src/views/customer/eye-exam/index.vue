<template>
  <div class="app-container">
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="顾客姓名" prop="customerName">
          <el-input
            v-model="queryParams.customerName"
            placeholder="请输入顾客姓名"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="手机号" prop="customerPhone">
          <el-input
            v-model="queryParams.customerPhone"
            placeholder="请输入手机号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="验光日期" prop="examDateRange">
          <el-date-picker
            v-model="examDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            :disabled-date="disabledDate"
          />
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
          v-hasPerm="['customer:eye-exam:add']"
          type="success"
          icon="plus"
          @click="handleOpenDialog()"
        >
          新增
        </el-button>
        <el-button
          v-hasPerm="['customer:eye-exam:delete']"
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
        <el-table-column key="id" label="主键ID" prop="id" min-width="80" align="center" />
        <el-table-column
          key="customerId"
          label="顾客"
          prop="customerId"
          min-width="120"
          align="center"
        >
          <template #default="scope">
            <div>
              <div>{{ scope.row.customerName }}</div>
              <div>{{ scope.row.customerPhone }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          key="examDate"
          label="验光日期"
          prop="examDate"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="optometrist"
          label="验光师"
          prop="optometrist"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="examType"
          label="验光类型"
          prop="examType"
          min-width="150"
          align="center"
        />
        <el-table-column label="左眼数据" align="center">
          <el-table-column key="osSph" label="球镜" prop="osSph" min-width="120" align="center" />
          <el-table-column key="osCyl" label="柱镜" prop="osCyl" min-width="120" align="center" />
          <el-table-column key="osAxis" label="轴位" prop="osAxis" min-width="120" align="center" />
          <el-table-column key="osPd" label="瞳距" prop="osPd" min-width="120" align="center" />
        </el-table-column>
        <el-table-column label="右眼数据" align="center">
          <el-table-column key="odSph" label="球镜" prop="odSph" min-width="120" align="center" />
          <el-table-column key="odCyl" label="柱镜" prop="odCyl" min-width="120" align="center" />
          <el-table-column key="odAxis" label="轴位" prop="odAxis" min-width="120" align="center" />
          <el-table-column key="odPd" label="瞳距" prop="odPd" min-width="120" align="center" />
        </el-table-column>
        <el-table-column
          key="pdTotal"
          label="双眼瞳距"
          prop="pdTotal"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="addition"
          label="下加光"
          prop="addition"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="hasGlassesHistory"
          label="是否有戴镜史"
          prop="hasGlassesHistory"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="isFirstExam"
          label="是否首次验光"
          prop="isFirstExam"
          min-width="150"
          align="center"
        />
        <el-table-column key="isDeleted" label="" prop="isDeleted" min-width="150" align="center" />
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
              v-hasPerm="['customer:eye-exam:edit']"
              type="primary"
              size="small"
              link
              icon="edit"
              @click="handleOpenDialog(scope.row.id)"
            >
              编辑
            </el-button>
            <el-button
              v-hasPerm="['customer:eye-exam:delete']"
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

    <!-- 验光记录表单弹窗 -->
    <el-drawer v-model="dialog.visible" :title="dialog.title" size="50%" @close="handleCloseDialog">
      <el-form ref="dataFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-input v-model="formData.id" type="hidden" />
        <el-form-item label="关联顾客" prop="customerId">
          <el-space v-if="selectedCustomer.id">
            <span>姓名：{{ selectedCustomer.name }}</span>
            <span>手机：{{ selectedCustomer.phone }}</span>
            <el-button v-if="!formData.id" type="primary" link @click="clearCustomerSelection">
              重新选择
            </el-button>
          </el-space>
          <el-row v-else :gutter="10" class="w-full">
            <el-col :span="18">
              <el-input
                v-model="customerSearch.phone"
                placeholder="请输入顾客手机号码进行检索"
                clearable
                @keyup.enter="searchCustomers"
              />
            </el-col>
            <el-col :span="6">
              <el-button type="primary" @click="searchCustomers">搜索</el-button>
            </el-col>
          </el-row>
          <el-table
            v-if="showCustomerTable && !selectedCustomer.id"
            :data="customerList"
            border
            highlight-current-row
            style="margin-top: 10px"
            @row-click="selectCustomer"
          >
            <el-table-column prop="name" label="顾客姓名" width="120" />
            <el-table-column prop="phone" label="手机号码" />
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button type="primary" link @click.stop="selectCustomer(scope.row)">
                  选择
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div
            v-if="showCustomerTable && !selectedCustomer.id && customerTotal === 0"
            class="el-table__empty-block"
          >
            <el-empty description="未找到相关顾客" :image-size="80">
              <el-button type="primary" @click="goToCustomerManagement">前往顾客管理</el-button>
            </el-empty>
          </div>
        </el-form-item>

        <el-form-item label="验光日期" prop="examDate">
          <el-date-picker
            v-model="formData.examDate"
            class="!w-[240px]"
            type="date"
            placeholder="验光日期"
            value-format="YYYY-MM-DD"
            :disabled-date="disabledDate"
          />
        </el-form-item>

        <el-form-item label="验光师" prop="optometrist">
          <el-input v-model="formData.optometrist" placeholder="验光师" />
        </el-form-item>

        <el-form-item label="验光类型" prop="examType">
          <el-input v-model="formData.examType" placeholder="验光类型" />
        </el-form-item>

        <!-- 左右眼数据分列显示 -->
        <el-row :gutter="20">
          <!-- 左眼数据列 -->
          <el-col :span="12">
            <el-card class="eye-data-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <span>左眼数据</span>
                </div>
              </template>

              <el-form-item label="球镜" prop="osSph">
                <el-input-number
                  v-model="formData.osSph"
                  placeholder="左眼球镜"
                  class="w-full"
                  controls-position="right"
                />
              </el-form-item>

              <el-form-item label="柱镜" prop="osCyl">
                <el-input-number
                  v-model="formData.osCyl"
                  placeholder="左眼柱镜"
                  class="w-full"
                  controls-position="right"
                />
              </el-form-item>

              <el-form-item label="轴位" prop="osAxis">
                <el-input-number
                  v-model="formData.osAxis"
                  placeholder="左眼轴位"
                  class="w-full"
                  controls-position="right"
                />
              </el-form-item>

              <el-form-item label="瞳距" prop="osPd">
                <el-input-number
                  v-model="formData.osPd"
                  placeholder="左眼瞳距"
                  class="w-full"
                  controls-position="right"
                />
              </el-form-item>
            </el-card>
          </el-col>

          <!-- 右眼数据列 -->
          <el-col :span="12">
            <el-card class="eye-data-card" shadow="never">
              <template #header>
                <div class="card-header">
                  <span>右眼数据</span>
                </div>
              </template>

              <el-form-item label="球镜" prop="odSph">
                <el-input-number
                  v-model="formData.odSph"
                  placeholder="右眼球镜"
                  class="w-full"
                  controls-position="right"
                />
              </el-form-item>

              <el-form-item label="柱镜" prop="odCyl">
                <el-input-number
                  v-model="formData.odCyl"
                  placeholder="右眼柱镜"
                  class="w-full"
                  controls-position="right"
                />
              </el-form-item>

              <el-form-item label="轴位" prop="odAxis">
                <el-input-number
                  v-model="formData.odAxis"
                  placeholder="右眼轴位"
                  class="w-full"
                  controls-position="right"
                />
              </el-form-item>

              <el-form-item label="瞳距" prop="odPd">
                <el-input-number
                  v-model="formData.odPd"
                  placeholder="右眼瞳距"
                  class="w-full"
                  controls-position="right"
                />
              </el-form-item>
            </el-card>
          </el-col>
        </el-row>

        <el-form-item label="双眼瞳距" prop="pdTotal">
          <el-input-number
            v-model="formData.pdTotal"
            placeholder="双眼瞳距"
            class="!w-[240px]"
            controls-position="right"
          />
        </el-form-item>

        <el-form-item label="下加光" prop="addition">
          <el-input v-model="formData.addition" placeholder="下加光" class="!w-[240px]" />
        </el-form-item>

        <!-- 眼镜佩戴历史（带镜史）专用区域 -->
        <el-card class="wearing-history-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>眼镜佩戴历史</span>
            </div>
          </template>

          <el-form-item label="是否有戴镜史" prop="hasGlassesHistory">
            <el-radio-group v-model="formData.hasGlassesHistory">
              <el-radio :value="0">否</el-radio>
              <el-radio :value="1">是</el-radio>
            </el-radio-group>
          </el-form-item>

          <div v-if="formData.hasGlassesHistory === 1 && formData.wearingHistoryObj">
            <!-- 基本信息 -->
            <el-divider content-position="left">基本信息</el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="是否首副眼镜" prop="wearingHistory.isFirstGlasses">
                  <el-switch
                    v-model="formData.wearingHistoryObj!.basicInfo.isFirstGlasses"
                    active-text="是"
                    inactive-text="否"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="是否佩戴过眼镜" prop="wearingHistory.hasWornGlasses">
                  <el-switch
                    v-model="formData.wearingHistoryObj!.basicInfo.hasWornGlasses"
                    active-text="是"
                    inactive-text="否"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="佩戴状态" prop="wearingHistory.wearingStatus">
                  <el-select
                    v-model="formData.wearingHistoryObj!.basicInfo.wearingStatus"
                    placeholder="请选择佩戴状态"
                    class="w-full"
                  >
                    <el-option label="目前在戴" value="current" />
                    <el-option label="过去佩戴" value="past" />
                    <el-option label="从未佩戴" value="never" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  v-if="formData.wearingHistoryObj!.basicInfo.wearingStatus !== 'never'"
                  label="佩戴年限"
                  prop="wearingHistory.wearingYears"
                >
                  <el-input-number
                    v-model="formData.wearingHistoryObj!.basicInfo.wearingYears"
                    placeholder="佩戴年限"
                    class="w-full"
                    :min="0"
                    controls-position="right"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item
              v-if="formData.wearingHistoryObj!.basicInfo.wearingStatus !== 'never'"
              label="开始佩戴年龄"
              prop="wearingHistory.startAge"
            >
              <el-input-number
                v-model="formData.wearingHistoryObj!.basicInfo.startAge"
                placeholder="开始佩戴年龄"
                class="!w-[240px]"
                :min="0"
                controls-position="right"
              />
            </el-form-item>

            <!-- 当前眼镜信息 -->
            <el-divider content-position="left">当前眼镜信息</el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="眼镜类型" prop="wearingHistory.currentGlasses.type">
                  <el-select
                    v-model="formData.wearingHistoryObj!.currentGlasses.type"
                    placeholder="请选择眼镜类型"
                    class="w-full"
                  >
                    <el-option label="单光镜" value="single_vision" />
                    <el-option label="双光镜" value="bifocal" />
                    <el-option label="渐进多焦点镜" value="progressive" />
                    <el-option label="老花镜" value="reading" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="镜框类型" prop="wearingHistory.currentGlasses.frameType">
                  <el-select
                    v-model="formData.wearingHistoryObj!.currentGlasses.frameType"
                    placeholder="请选择镜框类型"
                    class="w-full"
                  >
                    <el-option label="全框" value="full_rim" />
                    <el-option label="半框" value="semi_rim" />
                    <el-option label="无框" value="rimless" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="镜片材质" prop="wearingHistory.currentGlasses.lensMaterial">
                  <el-select
                    v-model="formData.wearingHistoryObj!.currentGlasses.lensMaterial"
                    placeholder="请选择镜片材质"
                    class="w-full"
                  >
                    <el-option label="树脂" value="resin" />
                    <el-option label="玻璃" value="glass" />
                    <el-option label="PC" value="pc" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="使用时长(月)" prop="wearingHistory.currentGlasses.ageMonths">
                  <el-input-number
                    v-model="formData.wearingHistoryObj!.currentGlasses.ageMonths"
                    placeholder="使用时长(月)"
                    class="w-full"
                    :min="0"
                    controls-position="right"
                  />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="购买地点" prop="wearingHistory.currentGlasses.purchaseLocation">
              <el-select
                v-model="formData.wearingHistoryObj!.currentGlasses.purchaseLocation"
                placeholder="请选择购买地点"
                class="!w-[240px]"
              >
                <el-option label="本店" value="our_shop" />
                <el-option label="其他眼镜店" value="other_shop" />
                <el-option label="网上购买" value="online" />
                <el-option label="医院" value="hospital" />
                <el-option label="超市/商场" value="mall" />
              </el-select>
            </el-form-item>

            <!-- 使用习惯 -->
            <el-divider content-position="left">使用习惯</el-divider>
            <el-form-item label="每日佩戴时长" prop="wearingHistory.usagePatterns.dailyDuration">
              <el-select
                v-model="formData.wearingHistoryObj!.usagePatterns.dailyDuration"
                placeholder="请选择每日佩戴时长"
                class="!w-[240px]"
              >
                <el-option label="全天佩戴" value="full_day" />
                <el-option label="偶尔佩戴" value="occasional" />
                <el-option label="只在特定场合佩戴" value="specific_occasions" />
              </el-select>
            </el-form-item>

            <el-form-item label="主要使用场景" prop="wearingHistory.usagePatterns.mainScenarios">
              <el-checkbox-group v-model="formData.wearingHistoryObj!.usagePatterns.mainScenarios">
                <el-checkbox value="reading">阅读</el-checkbox>
                <el-checkbox value="computer">电脑工作</el-checkbox>
                <el-checkbox value="driving">驾驶</el-checkbox>
                <el-checkbox value="outdoor">户外活动</el-checkbox>
                <el-checkbox value="sports">运动</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="佩戴频率" prop="wearingHistory.usagePatterns.frequency">
              <el-select
                v-model="formData.wearingHistoryObj!.usagePatterns.frequency"
                placeholder="请选择佩戴频率"
                class="!w-[240px]"
              >
                <el-option label="每天" value="everyday" />
                <el-option label="工作日" value="weekdays" />
                <el-option label="周末" value="weekends" />
                <el-option label="偶尔" value="occasionally" />
              </el-select>
            </el-form-item>

            <!-- 佩戴舒适度评估 -->
            <el-divider content-position="left">佩戴舒适度评估</el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="舒适度" prop="wearingHistory.comfortAssessment.comfortLevel">
                  <el-select
                    v-model="formData.wearingHistoryObj!.comfortAssessment.comfortLevel"
                    placeholder="请选择舒适度"
                    class="w-full"
                  >
                    <el-option label="非常舒适" value="very_comfortable" />
                    <el-option label="舒适" value="comfortable" />
                    <el-option label="一般" value="moderate" />
                    <el-option label="不舒适" value="uncomfortable" />
                    <el-option label="非常不舒适" value="very_uncomfortable" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="视力满意度"
                  prop="wearingHistory.comfortAssessment.visionSatisfaction"
                >
                  <el-select
                    v-model="formData.wearingHistoryObj!.comfortAssessment.visionSatisfaction"
                    placeholder="请选择视力满意度"
                    class="w-full"
                  >
                    <el-option label="非常满意" value="very_satisfied" />
                    <el-option label="满意" value="satisfied" />
                    <el-option label="一般" value="moderate" />
                    <el-option label="不满意" value="unsatisfied" />
                    <el-option label="非常不满意" value="very_unsatisfied" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="具体问题" prop="wearingHistory.comfortAssessment.specificIssues">
              <el-checkbox-group
                v-model="formData.wearingHistoryObj!.comfortAssessment.specificIssues"
              >
                <el-checkbox value="dizziness">头晕</el-checkbox>
                <el-checkbox value="eye_strain">眼疲劳</el-checkbox>
                <el-checkbox value="headache">头痛</el-checkbox>
                <el-checkbox value="blurry_vision">视物模糊</el-checkbox>
                <el-checkbox value="nausea">恶心</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <!-- 变更信息 -->
            <el-divider content-position="left">变更信息</el-divider>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="变更原因" prop="wearingHistory.changeInfo.changeReason">
                  <el-select
                    v-model="formData.wearingHistoryObj!.changeInfo.changeReason"
                    placeholder="请选择变更原因"
                    class="w-full"
                  >
                    <el-option label="定期检查" value="routine_check" />
                    <el-option label="度数变化" value="prescription_change" />
                    <el-option label="镜片磨损" value="lens_wear" />
                    <el-option label="镜框损坏" value="frame_damage" />
                    <el-option label="丢失/被盗" value="lost_stolen" />
                    <el-option label="外观/款式" value="appearance_style" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="变更类型" prop="wearingHistory.changeInfo.changeType">
                  <el-select
                    v-model="formData.wearingHistoryObj!.changeInfo.changeType"
                    placeholder="请选择变更类型"
                    class="w-full"
                  >
                    <el-option label="更新" value="update" />
                    <el-option label="新增" value="new" />
                    <el-option label="更换" value="replace" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-card>

        <!-- 佩戴历史对象，用于存储JSON格式的佩戴历史数据 -->
        <el-form-item label="带镜史数据" prop="wearingHistory" style="display: none">
          <el-input
            v-model="formData.wearingHistory"
            placeholder="带镜史数据"
            class="!w-[240px]"
            type="hidden"
          />
        </el-form-item>

        <el-form-item label="是否首次验光" prop="isFirstExam">
          <el-radio-group v-model="formData.isFirstExam">
            <el-radio :value="0">否</el-radio>
            <el-radio :value="1">是</el-radio>
          </el-radio-group>
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
  name: "EyeExam",
  inheritAttrs: false,
});

import EyeExamAPI, {
  EyeExamPageVO,
  EyeExamForm,
  EyeExamPageQuery,
} from "@/api/customer/eye-exam-api";
import CustomerAPI, { CustomerPageVO, CustomerPageQuery } from "@/api/customer/customer-api";
import { useRouter } from "vue-router";

const queryFormRef = ref();
const dataFormRef = ref();
const router = useRouter();

const loading = ref(false);
const removeIds = ref<number[]>([]);
const total = ref(0);

// 验光日期范围
const examDateRange = ref<string[]>([]);

const queryParams = reactive<EyeExamPageQuery>({
  pageNum: 1,
  pageSize: 10,
  customerName: undefined,
  customerPhone: undefined,
  examDateBegin: undefined,
  examDateEnd: undefined,
});

// 顾客搜索相关
const customerSearch = reactive({
  phone: "",
});
const customerList = ref<CustomerPageVO[]>([]);
const customerTotal = ref(0);
const showCustomerTable = ref(false);
const selectedCustomer = reactive({
  id: undefined as number | undefined,
  name: "",
  phone: "",
});

// 验光记录表格数据
const pageData = ref<EyeExamPageVO[]>([]);

// 弹窗
const dialog = reactive({
  title: "",
  visible: false,
});

// 验光记录表单数据
const formData = reactive<EyeExamForm>({
  wearingHistoryObj: {
    version: 1,
    isCurrent: true,
    basicInfo: {
      isFirstGlasses: false,
      hasWornGlasses: true,
      wearingStatus: "current",
      wearingYears: 0,
      startAge: 0,
    },
    currentGlasses: {
      type: "single_vision",
      frameType: "full_rim",
      lensMaterial: "resin",
      ageMonths: 0,
      purchaseLocation: "our_shop",
    },
    usagePatterns: {
      dailyDuration: "full_day",
      mainScenarios: [],
      frequency: "everyday",
    },
    comfortAssessment: {
      comfortLevel: "comfortable",
      visionSatisfaction: "satisfied",
      specificIssues: [],
    },
    changeInfo: {
      changeReason: "routine_check",
      changeType: "update",
    },
  },
});

// 验光记录表单校验规则
const rules = reactive({
  id: [{ required: true, message: "请输入主键ID", trigger: "blur" }],
  examDate: [{ required: true, message: "请输入验光日期", trigger: "blur" }],
  customerId: [
    {
      required: true,
      validator: (rule: any, value: any, callback: any) => {
        if (!selectedCustomer.id) {
          callback(new Error("请选择关联顾客"));
        } else {
          callback();
        }
      },
      trigger: "change",
    },
  ],
});

/** 查询验光记录 */
function handleQuery() {
  loading.value = true;
  // 处理验光日期范围查询参数
  if (examDateRange.value && examDateRange.value.length === 2) {
    queryParams.examDateBegin = examDateRange.value[0];
    queryParams.examDateEnd = examDateRange.value[1];
  } else {
    queryParams.examDateBegin = undefined;
    queryParams.examDateEnd = undefined;
  }

  EyeExamAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

/** 重置验光记录查询 */
function handleResetQuery() {
  queryFormRef.value!.resetFields();
  examDateRange.value = [];
  queryParams.pageNum = 1;
  queryParams.examDateBegin = undefined;
  queryParams.examDateEnd = undefined;
  handleQuery();
}

/** 行复选框选中记录选中ID集合 */
function handleSelectionChange(selection: any) {
  removeIds.value = selection.map((item: any) => item.id);
}

/** 搜索顾客 */
function searchCustomers() {
  if (!customerSearch.phone) {
    ElMessage.warning("请输入手机号码");
    return;
  }

  const queryParams: CustomerPageQuery = {
    pageNum: 1,
    pageSize: 10,
    phone: customerSearch.phone,
  };

  CustomerAPI.getPage(queryParams).then((data) => {
    customerList.value = data.list;
    customerTotal.value = data.total;
    showCustomerTable.value = true;
  });
}

/** 选择顾客 */
function selectCustomer(customer: CustomerPageVO) {
  selectedCustomer.id = customer.id;
  selectedCustomer.name = customer.name || "";
  selectedCustomer.phone = customer.phone || "";
  formData.customerId = customer.id ? Number(customer.id) : undefined;
  showCustomerTable.value = false;
  // 清除表单验证错误
  if (dataFormRef.value) {
    dataFormRef.value.clearValidate("customerId");
  }
}

/** 清除顾客选择 */
function clearCustomerSelection() {
  selectedCustomer.id = undefined;
  selectedCustomer.name = "";
  selectedCustomer.phone = "";
  formData.customerId = undefined;
  customerSearch.phone = "";
  customerList.value = [];
  customerTotal.value = 0;
  showCustomerTable.value = false;
  // 重新验证customerId字段
  nextTick(() => {
    if (dataFormRef.value) {
      dataFormRef.value.validateField("customerId");
    }
  });
}

/** 前往顾客管理页面 */
function goToCustomerManagement() {
  // 关闭当前弹窗
  dialog.visible = false;
  // 跳转到顾客管理页面
  router.push("/customer/customer");
}

/** 打开验光记录弹窗 */
function handleOpenDialog(id?: number) {
  dialog.visible = true;
  if (id) {
    dialog.title = "修改验光记录";
    EyeExamAPI.getFormData(id).then((data) => {
      Object.assign(formData, data);
      // 如果是编辑模式，设置选中的顾客信息
      if (data.customerId) {
        selectedCustomer.id = data.customerId;
        selectedCustomer.name = data.customerName || "";
        selectedCustomer.phone = data.customerPhone || "";
      }

      // 解析佩戴历史JSON数据
      if (data.wearingHistory) {
        try {
          formData.wearingHistoryObj = JSON.parse(data.wearingHistory);
        } catch (e) {
          console.error("Failed to parse wearing history", e);
          // 如果解析失败，使用默认值
          formData.wearingHistoryObj = {
            version: 1,
            isCurrent: true,
            basicInfo: {
              isFirstGlasses: false,
              hasWornGlasses: true,
              wearingStatus: "current",
              wearingYears: 0,
              startAge: 0,
            },
            currentGlasses: {
              type: "single_vision",
              frameType: "full_rim",
              lensMaterial: "resin",
              ageMonths: 0,
              purchaseLocation: "our_shop",
            },
            usagePatterns: {
              dailyDuration: "full_day",
              mainScenarios: [],
              frequency: "everyday",
            },
            comfortAssessment: {
              comfortLevel: "comfortable",
              visionSatisfaction: "satisfied",
              specificIssues: [],
            },
            changeInfo: {
              changeReason: "routine_check",
              changeType: "update",
            },
          };
        }
      }
    });
  } else {
    dialog.title = "新增验光记录";
    // 重置顾客选择状态
    clearCustomerSelection();
    // 重置佩戴历史数据
    formData.wearingHistoryObj = {
      version: 1,
      isCurrent: true,
      basicInfo: {
        isFirstGlasses: false,
        hasWornGlasses: true,
        wearingStatus: "current",
        wearingYears: 0,
        startAge: 0,
      },
      currentGlasses: {
        type: "single_vision",
        frameType: "full_rim",
        lensMaterial: "resin",
        ageMonths: 0,
        purchaseLocation: "our_shop",
      },
      usagePatterns: {
        dailyDuration: "full_day",
        mainScenarios: [],
        frequency: "everyday",
      },
      comfortAssessment: {
        comfortLevel: "comfortable",
        visionSatisfaction: "satisfied",
        specificIssues: [],
      },
      changeInfo: {
        changeReason: "routine_check",
        changeType: "update",
      },
    };
  }
}

/** 提交验光记录表单 */
function handleSubmit() {
  dataFormRef.value.validate((valid: any) => {
    if (valid) {
      loading.value = true;
      // 确保 customerId 是 number 类型
      if (formData.customerId) {
        formData.customerId = Number(formData.customerId);
      }

      // 确保wearingHistoryObj存在
      if (!formData.wearingHistoryObj) {
        formData.wearingHistoryObj = {
          version: 1,
          isCurrent: true,
          basicInfo: {
            isFirstGlasses: false,
            hasWornGlasses: true,
            wearingStatus: "current",
            wearingYears: 0,
            startAge: 0,
          },
          currentGlasses: {
            type: "single_vision",
            frameType: "full_rim",
            lensMaterial: "resin",
            ageMonths: 0,
            purchaseLocation: "our_shop",
          },
          usagePatterns: {
            dailyDuration: "full_day",
            mainScenarios: [],
            frequency: "everyday",
          },
          comfortAssessment: {
            comfortLevel: "comfortable",
            visionSatisfaction: "satisfied",
            specificIssues: [],
          },
          changeInfo: {
            changeReason: "routine_check",
            changeType: "update",
          },
        };
      }

      // 创建一个不包含wearingHistory的formData副本，只保留wearingHistoryObj对象
      const submitData = { ...formData };
      delete submitData.wearingHistory;

      const id = formData.id;
      if (id) {
        EyeExamAPI.update(id, submitData)
          .then(() => {
            ElMessage.success("修改成功");
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        EyeExamAPI.create(submitData)
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

/** 关闭验光记录弹窗 */
function handleCloseDialog() {
  dialog.visible = false;
  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();
  formData.id = undefined;
  // 重置顾客选择状态
  clearCustomerSelection();
}

/** 删除验光记录 */
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
      EyeExamAPI.deleteByIds(ids)
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

/** 限制日期选择范围 */
function disabledDate(date: Date) {
  // 禁用大于今天的日期
  return date.getTime() > Date.now();
}

onMounted(() => {
  handleQuery();
});
</script>

<style scoped>
.eye-data-card {
  margin-bottom: 20px;
}

.card-header {
  font-weight: bold;
  text-align: center;
}

:deep(.el-input-number.is-controls-right .el-input__wrapper) {
  padding-right: 40px;
}
</style>
