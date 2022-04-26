<template>
  <div>
    <el-breadcrumb>
      <el-breadcrumb-item :to="'/home'">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="6">
          <el-input
            placeholder="请输入商品名称"
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
        <el-col :span="3">
          <el-button type="primary" class="searchBtn" @click="goAddPage"
            >添加商品</el-button
          >
        </el-col>
      </el-row>
      <el-table border :data="listData">
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column
          label="商品价格"
          width="95px"
          prop="goods_price"
        ></el-table-column>
        <el-table-column
          label="商品重量"
          width="80px"
          prop="goods_weight"
        ></el-table-column>
        <el-table-column label="创建时间" width="200px" prop="add_time">
          <template slot-scope="scope">
            {{ scope.row.add_time | date('YYYY-MM-DD hh:mm:ss') }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit">
            </el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
            >
            </el-button>
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
  </div>
</template>

<script>
import { BASE_URL } from '@/config/config'

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
      listData: []
    }
  },
  mounted() {
    this.getListData()
  },
  methods: {
    async getListData() {
      const { data: res } = await this.$http.get(`${BASE_URL}/goods`, {
        params: this.queryParams
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      res.data.goods.forEach((item) => {
        item.add_time = item.add_time * 1000
        item.upd_time = item.upd_time * 1000
      })
      this.total = res.data.total
      this.listData = res.data.goods
      console.log('listData', this.listData)
    },
    handleSizeChange(val) {
      this.queryParams.pagesize = val
      this.getListData()
    },
    handleCurrentChange(val) {
      this.queryParams.pagenum = val
      this.getListData()
    },

    async handleDelete(row) {
      const confirm = await this.$confirm('确认删除商品吗', '提示', {
        cancelButtonText: '取消',
        confirmButtonText: '确认',
        type: 'warning'
      }).catch(() => {
        return this.$message.info('已取消删除商品')
      })

      if (confirm === 'confirm') {
        const { data: res } = await this.$http.delete(
          `${BASE_URL}/goods/${row.goods_id}`
        )
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.getListData()
      }
    },

    goAddPage() {
      this.$router.push('/goods/add')
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

.searchBtn {
  margin-left: 10px;
}
</style>
