<template>
  <div>
    <el-breadcrumb>
      <el-breadcrumb-item :to="'/home'">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="6">
          <el-input
            placeholder="请输入订单号"
            v-model="queryParams.query"
            clearable
            @clear="getListData"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getListData"
            ></el-button>
          </el-input>
        </el-col>
      </el-row>
      <el-table border :data="listData">
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column
          label="订单价格"
          width="150px"
          prop="order_price"
        ></el-table-column>
        <el-table-column label="是否付款" width="100px">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.pay_status === '0'"
              >未付款</el-tag
            >
            <el-tag type="primary" v-if="scope.row.pay_status === '1'"
              >已付款</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column label="是否发货" width="80px" prop="is_send">
        </el-table-column>
        <el-table-column label="下单时间" width="200px">
          <template slot-scope="scope">{{
            scope.row.create_time | date('YYYY-MM-DD hh:mm:ss')
          }}</template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-tooltip content="修改地址" :enterable="false" placement="top">
              <el-button
                size="mini"
                type="primary"
                icon="el-icon-edit"
                @click="openAddress"
              >
              </el-button>
            </el-tooltip>
            <el-tooltip
              content="查看物流信息"
              :enterable="false"
              placement="top"
            >
              <el-button
                size="mini"
                type="success"
                icon="el-icon-location"
                @click="openProgress(scope.row)"
              >
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :page-sizes="pagesizes"
        :page-size="queryParams.pagesize"
        :page-count="queryParams.pagenum"
        :total="total"
        layout="sizes, prev, pager, next, jumper, ->, total"
      >
      </el-pagination>
    </el-card>
    <!-- 修改地址 -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressVisible"
      :close-on-click-modal="false"
      width="50%"
      @close="addressDialogClosed"
    >
      <el-form
        :model="addressForm"
        :rules="addressFormRules"
        ref="addressFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            :options="cityData"
            v-model="addressForm.address1"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressClose">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 物流信息 -->
    <el-dialog
      width="50%"
      modal
      center
      :visible.sync="progressVisible"
      title="物流进度"
    >
      <el-timeline :reverse="reverse">
        <el-timeline-item
          v-for="(activity, index) in activities"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import { BASE_URL } from '@/config/config'
import kuaidi from './kuaidi'
import cityData from './citydata'
export default {
  data() {
    return {
      pagesizes: [10, 20, 50],
      total: 0,
      queryParams: {
        query: '',
        pagesize: 10,
        pagenum: 1
      },
      listData: [],
      progressVisible: false,
      addressVisible: false,
      reverse: true,
      activities: [],
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      cityData
    }
  },
  mounted() {
    this.getListData()
  },
  methods: {
    async getListData() {
      const { data: res } = await this.$http.get(`${BASE_URL}/orders`, {
        params: this.queryParams
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      res.data.goods.forEach((item) => {
        item.update_time = item.update_time * 1000
        item.create_time = item.create_time * 1000
      })
      this.total = res.data.total
      this.listData = res.data.goods
      console.log('listData', this.listData)
    },
    async openProgress(row) {
      // TODO 替换为row上的快递单号
      // 现在接口需要token 无法正常查询用json代替
      // const id = '1106975712662'
      // const { data: res } = await this.$http.get(`${BASE_URL}/kuaidi/${id}`)
      // if (res.meta.status !== 200) {
      //   return this.$message.error(res.meta.msg)
      // }

      this.activities = kuaidi.data

      this.progressVisible = true
    },
    handleSizeChange(val) {
      this.queryParams.pagesize = val
      this.getListData()
    },
    handleCurrentChange(val) {
      this.queryParams.pagenum = val
      this.getListData()
    },

    openAddress() {
      this.addressVisible = true
    },
    addressClose() {
      this.$refs.addressFormRef.validate((isValid) => {
        if (isValid) {
          this.addressVisible = false
        }
      })
    },
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 10px;
}
.el-pagination {
  margin-top: 10px;
}
</style>
