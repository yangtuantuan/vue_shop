<template>
  <div>
    <el-breadcrumb>
      <el-breadcrumb-item :to="'/home'">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 搜索和添加 -->
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input
            v-model="queryParams.query"
            placeholder="根据用户名查询"
            clearable
            @clear="handleSeach"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="handleSeach"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="addFormVisible = true"
            >添加用户</el-button
          >
        </el-col>
        <!-- <el-col :span="2" :offset="14">
          <el-button type="danger">保存</el-button>
        </el-col> -->
      </el-row>
      <!-- 表格 -->
      <el-table :data="usersData" stripe border style="width: 100%">
        <el-table-column label="#" type="index"> </el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="handleStateChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="190px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="openEditUser(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="handleDeleteUser(scope.row.id)"
            ></el-button>
            <el-tooltip content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                size="mini"
                icon="el-icon-s-tools"
                @click="openSetRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
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
      title="添加用户"
      :visible.sync="addFormVisible"
      modal
      @closed="handleAddClosed"
      :close-on-click-modal="false"
    >
      <el-form
        :model="addForm"
        :label-width="addFormLabelWidth"
        :rules="addFormRules"
        ref="addFormRef"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="addForm.username"
            placeholder="请输入用户名"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            type="password"
            v-model="addForm.password"
            placeholder="输入密码"
            autocomplete="off"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="email" prop="email">
          <el-input
            type="text"
            v-model="addForm.email"
            placeholder="输入邮箱"
            autocomplete="off"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input
            type="text"
            v-model="addForm.mobile"
            placeholder="输入手机号码"
            autocomplete="off"
          >
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleAddUser">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 修改弹窗 -->
    <el-dialog
      modal
      width="50%"
      title="修改用户信息"
      :visible.sync="editFormVisible"
      @close="handleEditClosed"
      :close-on-click-modal="false"
    >
      <el-form
        ref="editFormRef"
        :rules="editFormRules"
        :model="editForm"
        :label-width="addFormLabelWidth"
      >
        <el-form-item label="用户名" prop="username">
          <el-input disabled v-model="editForm.username"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="editFormVisible = false">取消</el-button>
        <el-button type="danger" @click="handleEditUser(editForm.id)"
          >确定</el-button
        >
      </div>
    </el-dialog>

    <!-- 分配角色 -->
    <el-dialog
      modal
      width="40%"
      title="分配角色"
      :visible.sync="setRoleFormVisible"
      @close="handleSetRoleClosed"
      :close-on-click-modal="false"
    >
      <div>
        <p>当前用户 {{ userInfo.username }}</p>
        <p>当前用户角色 {{ userInfo.role_name }}</p>
        <div>
          <span>分配角色: </span>
          <el-select v-model="selectRole" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </div>
      </div>
      <div slot="footer">
        <el-button @click="setRoleFormVisible = false">取消</el-button>
        <el-button type="danger" @click="handleSetRole(editForm.id)">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { BASE_URL } from '@/config/config'
export default {
  name: 'Users',
  data() {
    return {
      usersData: [],
      queryParams: {
        pagenum: 1,
        pagesize: 10,
        query: ''
      },
      pagesizes: [10, 20, 50],
      total: 0,
      addFormVisible: false,
      editFormVisible: false,
      setRoleFormVisible: false,
      addFormLabelWidth: '80px',
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '字符长度 3 到 10', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 15, message: '密码长度 3 到 15', trigger: 'blur' }
        ],
        email: [
          {
            type: 'email',
            required: true,
            message: '请输入正确的邮箱',
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            trigger: 'blur',
            message: '请输入手机号码'
          },
          {
            pattern:
              /^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/,
            trigger: 'blur',
            message: '请输入正确的手机号码'
          }
        ]
      },

      editForm: {
        username: '',
        email: '',
        mobile: '',
        id: ''
      },
      editFormRules: {
        username: [],
        email: [
          {
            type: 'email',
            required: true,
            message: '请输入正确的email',
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            pattern:
              /^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/,
            trigger: 'blur',
            message: '请输入正确的手机号码'
          }
        ]
      },
      userInfo: {
        id: '',
        role_name: '',
        username: ''
      },
      rolesList: [],
      selectRole: ''
    }
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get(`${BASE_URL}/users`, {
        params: this.queryParams
      })
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg)
        return
      }

      this.usersData = res.data.users
      this.total = res.data.total
      console.log('usersData', this.usersData)
    },
    handleSizeChange(val) {
      this.queryParams.pagesize = val
      this.getUserList()
    },
    handleCurrentChange(val) {
      this.queryParams.pagenum = val
      this.getUserList()
    },
    handleSeach(val) {
      this.queryParams.pagenum = 1
      this.getUserList()
    },
    handleAddUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return false
        const { data: res } = await this.$http.post(
          `${BASE_URL}/users`,
          this.addForm
        )
        if (res.meta.status !== 201) {
          this.$message.error(res.meta.msg)
          this.addFormVisible = false
          return
        }
        this.$message.success('添加用户成功')
        this.getUserList()
        this.addFormVisible = false
      })
    },
    handleAddClosed() {
      this.$refs.addFormRef.resetFields()
    },
    async handleStateChange(user) {
      const { data: res } = await this.$http.put(
        `${BASE_URL}/users/${user.id}/state/${user.mg_state}`
      )
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg)
        return
      }
      this.$message.success(res.meta.msg)
      this.getUserList()
    },

    async openEditUser(id) {
      this.editForm.id = id
      const { data: res } = await this.$http.get(`${BASE_URL}/users/${id}`)
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg)
        return
      }

      const { username, email, mobile } = res.data
      this.editForm = {
        username,
        email,
        mobile
      }
      this.editFormVisible = true
    },

    handleEditUser(id) {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) {
          return false
        } else {
          const { data: res } = await this.$http.put(
            `${BASE_URL}/users/${id}`,
            this.editForm
          )
          if (res.meta.status !== 200) {
            this.$message.error(res.meta.msg)
            return
          }
          this.$message.success(res.meta.msg)
          this.getUserList()
          this.editFormVisible = false
        }
      })
    },

    handleEditClosed() {
      this.$refs.editFormRef.resetFields()
    },

    async handleDeleteUser(id) {
      const confirm = await this.$confirm(
        '此操作将永久删除用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          closeOnClickModal: false
        }
      ).catch((err) => {
        this.$message.info('已取消删除')
        return err
      })

      if (confirm === 'confirm') {
        const { data: res } = await this.$http.delete(`${BASE_URL}/users/${id}`)
        if (res.meta.status !== 200) {
          this.$message.error(res.meta.msg)
          return
        }

        this.$message.success(res.meta.msg)
        this.getUserList()
      }
    },

    async openSetRole(row) {
      this.userInfo = {
        id: row.id,
        username: row.username,
        role_name: row.role_name
      }

      const { data: res } = await this.$http.get(`${BASE_URL}/roles`)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.rolesList = res.data
      this.setRoleFormVisible = true
    },

    async handleSetRole() {
      if (!this.selectRole) {
        return
      }
      const { data: res } = await this.$http.put(
        `${BASE_URL}/users/${this.userInfo.id}/role`,
        {
          rid: this.selectRole
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      this.getUserList()
      this.setRoleFormVisible = false
    },

    handleSetRoleClosed() {
      this.selectRole = null
      this.rolesList = []
      this.userInfo = {
        id: '',
        role_name: '',
        username: ''
      }
    }
  },
  created() {
    this.getUserList()
  }
}
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 12px;
}

.el-pagination {
  margin-top: 12px;
}

.el-select {
  margin-left: 8px;
}
</style>
