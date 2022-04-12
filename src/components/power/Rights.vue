<template>
  <div>
    <el-breadcrumb>
      <el-breadcrumb-item :to="'/home'">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 表格 -->
      <el-table :data="displayData" stripe border style="width: 100%">
        <el-table-column label="#" type="index"> </el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column label="权限等级">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag v-if="scope.row.level === '1'" type="success">二级</el-tag>
            <el-tag v-if="scope.row.level === '2'" type="warning">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :page-sizes="pagesizes"
        :total="total"
        :current-page="pagenum"
        layout="sizes, prev, pager, next, jumper, ->, total"
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
import { BASE_URL } from '@/config/config'
export default {
  data() {
    return {
      pagesizes: [10, 20, 50],
      pagesize: 10,
      pagenum: 1,
      total: 0,
      rightsData: [],
      displayData: []
    }
  },
  created() {
    this.getRightList()
  },
  methods: {
    async getRightList() {
      const { data: res } = await this.$http.get(`${BASE_URL}/rights/list`)
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg)
        return
      }
      this.rightsData = res.data
      this.total = res.data.length
      this.formateDisplayData()
    },
    handleSizeChange(val) {
      this.pagesize = val
      this.formateDisplayData()
    },
    handleCurrentChange(val) {
      this.pagenum = val
      this.formateDisplayData()
    },

    formateDisplayData() {
      this.displayData = this.rightsData.slice(
        (this.pagenum - 1) * this.pagesize,
        this.pagenum * this.pagesize
      )
      console.log('displayData', this.displayData)
    }
  }
}
</script>

<style lang="less" scoped>
.el-pagination {
  margin-top: 10px;
}
</style>
