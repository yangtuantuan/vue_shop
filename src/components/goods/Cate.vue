<template>
  <div>
    <el-breadcrumb>
      <el-breadcrumb-item :to="'/home'">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="openAddCate">添加分类</el-button>
        </el-col>
      </el-row>
      <tree-table
        :data="cateData"
        :columns="columns"
        :selection-type="false"
        show-index
        border
        tree-type
        children-prop="children"
        index-text="#"
        :expand-type="false"
      >
        <!-- 是否有效 -->
        <template slot="cat_deleted" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="!scope.row.cat_deleted"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template slot="cat_level" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag v-if="scope.row.cat_level === 1" type="warning">
            二级
          </el-tag>
          <el-tag v-if="scope.row.cat_level === 2" type="danger">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="action" slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="openEditCate(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="deleteCate(scope.row)"
          >
            删除
          </el-button>
        </template>
      </tree-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :page-sizes="pagesizes"
        :page-size="queryParams.pagesize"
        :total="total"
        :current-page="queryParams.pagenum"
        layout="sizes, prev, pager, next, jumper, ->, total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加弹窗 -->
    <el-dialog
      width="40%"
      title="添加分类"
      :visible.sync="addFormVisible"
      modal
      @closed="handleAddClosed"
      :close-on-click-modal="false"
    >
      <el-form
        :model="addForm"
        label-width="100px"
        :rules="addFormRules"
        ref="addFormRef"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input
            v-model="addForm.cat_name"
            placeholder="请输入分类名称"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
            :options="parentCateData"
            :props="cascaderProps"
            clearable
            show-all-levels
            v-model="selectedKeys"
            @change="parentCateChange"
          >
          </el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleAddCate">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 修改弹窗 -->
    <el-dialog
      width="40%"
      title="修改分类"
      :visible.sync="editFormVisible"
      modal
      @closed="handleEditClosed"
      :close-on-click-modal="false"
    >
      <el-form
        :model="editForm"
        label-width="100px"
        :rules="editFormRules"
        ref="editFormRef"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input
            v-model="editForm.cat_name"
            placeholder="请输入分类名称"
            autocomplete="off"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleEditCate">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { BASE_URL } from '@/config/config'
import TreeTable from 'vue-table-with-tree-grid'
export default {
  components: { 'tree-table': TreeTable },
  data() {
    return {
      cateData: [],
      parentCateData: [],
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          type: 'template',
          template: 'cat_deleted'
        },
        {
          label: '排序',
          prop: 'cat_level',
          type: 'template',
          template: 'cat_level'
        },
        {
          label: '操作',
          type: 'template',
          template: 'action'
        }
      ],
      queryParams: {
        pagenum: 1,
        pagesize: 5,
        type: 3
      },
      total: 0,
      pagesizes: [5, 10, 20],

      addFormVisible: false,
      addForm: {
        cat_pid: 0, // 分类父 ID
        cat_name: '', // 分类名称
        cat_level: 0 // 分类层级
      },
      addFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true,
        expandTrigger: 'hover'
      },
      selectedKeys: [],

      editCateId: '',
      editFormVisible: false,
      editForm: {
        cat_name: ''
      },
      editFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get(`${BASE_URL}/categories`, {
        params: this.queryParams
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.total = res.data.total
      this.cateData = res.data.result
      console.log('cateData', this.cateData)
    },

    handleSizeChange(val) {
      this.queryParams.pagesize = val
      this.getCateList()
    },
    handleCurrentChange(val) {
      this.queryParams.pagenum = val
      this.getCateList()
    },

    async openAddCate() {
      const { data: res } = await this.$http.get(`${BASE_URL}/categories`, {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.parentCateData = res.data
      this.addFormVisible = true
    },
    parentCateChange() {
      this.addForm.cat_pid =
        this.selectedKeys[this.selectedKeys.length - 1] || 0
      this.addForm.cat_level = this.selectedKeys.length
      console.log(this.addForm)
    },
    async handleAddCate() {
      const valid = await this.$refs.addFormRef.validate().catch((err) => {
        return err
      })
      if (!valid) {
        return
      }
      const { data: res } = await this.$http.post(
        `${BASE_URL}/categories`,
        this.addForm
      )
      if (res.meta.status !== 201) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      this.getCateList()
      this.addFormVisible = false
    },
    handleAddClosed() {
      this.selectedKeys = []
      this.addForm.cat_pid = 0
      this.addForm.cat_level = 0
      this.$refs.addFormRef.resetFields()
    },

    openEditCate(row) {
      this.editForm.cat_name = row.cat_name
      this.editCateId = row.cat_id
      this.editFormVisible = true
    },
    async handleEditCate() {
      const valid = await this.$refs.editFormRef.validate().catch((err) => {
        return err
      })
      if (!valid) {
        return
      }
      const { data: res } = await this.$http.put(
        `${BASE_URL}/categories/${this.editCateId}`,
        this.editForm
      )
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      this.getCateList()
      this.editFormVisible = false
    },
    handleEditClosed() {
      this.$refs.editFormRef.resetFields()
      this.editCateId = ''
    },

    async deleteCate(row) {
      const confirm = await this.$confirm(
        `确定要删除分类 ${row.cat_name} 吗？`,
        '提示',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(() => {
        this.$message.info('已取消删除')
      })

      if (confirm === 'confirm') {
        const { data: res } = await this.$http.delete(
          `${BASE_URL}/categories/${row.cat_id}`
        )
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.getCateList()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.zk-table {
  margin-top: 10px;
  width: 100%;
}

.el-pagination {
  margin-top: 10px;
}

.el-cascader {
  width: 100%;
}
</style>
