<template>
  <div>
    <el-breadcrumb>
      <el-breadcrumb-item :to="'/home'">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 添加角色 -->
      <el-row :gutter="20">
        <el-col :span="5">
          <el-button type="primary" @click="addRoleVisible = true">
            添加角色
          </el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table :data="displayData" stripe border style="width: 100%">
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
              :class="['bdbottom', 'vcenter', i1 === 0 ? 'bdtop' : '']"
            >
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                  :class="[i2 !== 0 ? 'bdtop' : '', 'vcenter']"
                >
                  <el-col :span="6">
                    <el-tag
                      closable
                      type="success"
                      @close="removeRightById(scope.row, item2.id)"
                    >
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="#" type="index"> </el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="350px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              content="编辑"
              size="mini"
              icon="el-icon-edit"
              @click="handleEditRole(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="deleteRole(scope.row)"
            >
              删除
            </el-button>
            <el-button
              type="warning"
              size="mini"
              icon="el-icon-s-tools"
              @click="openSetRight(scope.row)"
            >
              分配角色
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :page-sizes="pagesizes"
        :page-size="pagesize"
        :total="total"
        :current-page="pagenum"
        layout="sizes, prev, pager, next, jumper, ->, total"
      >
      </el-pagination>
    </el-card>

    <!-- 分配权限 -->
    <el-dialog
      width="40%"
      title="分配权限"
      :visible.sync="setRightVisible"
      modal
      @closed="closedSetRight"
      :close-on-click-modal="false"
    >
      <el-tree
        :data="rightsTreeData"
        show-checkbox
        node-key="id"
        :default-expanded-keys="rightsCheckedKeys"
        :default-checked-keys="rightsCheckedKeys"
        :props="rightsTreeProps"
        ref="rightsTreeRef"
      >
      </el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click="setRightVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSetRight">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 添加弹窗 -->
    <el-dialog
      :title="addRoleFormType === 'add' ? '添加角色' : '编辑角色'"
      :visible.sync="addRoleVisible"
      modal
      @closed="handleAddClosed"
      :close-on-click-modal="false"
      width="40%"
    >
      <el-form
        :rules="addRoleRules"
        :model="addRoleForm"
        :label-width="addRoleLabelWidth"
        ref="addRoleRef"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input
            v-model="addRoleForm.roleName"
            placeholder="请输入角色名称 3-15 字符"
          ></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input
            type="textarea"
            placeholder="请输入角色描述"
            :autosize="{ minRows: 2, maxRows: 4 }"
            v-model="addRoleForm.roleDesc"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addRoleVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleAddRole()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { BASE_URL } from '@/config/config'
export default {
  data() {
    return {
      addRoleVisible: false,
      addRoleLabelWidth: '120px',
      addRoleFormType: 'add',
      setRightVisible: false,
      pagesizes: [10, 20, 50],
      pagesize: 10,
      total: 0,
      pagenum: 1,
      displayData: [],
      rolesData: [],
      roleId: '',
      rightsTreeData: {},
      rightsTreeProps: {
        children: 'children',
        label: 'authName'
      },
      rightsCheckedKeys: [],
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      addRoleRules: {
        roleName: [
          {
            required: true,
            trigger: 'blur',
            message: '请输入角色名称'
          },
          {
            min: 2,
            max: 15,
            trigger: 'blur',
            message: '请输入 2 - 15 个字符'
          }
        ],
        roleDesc: []
      }
    }
  },
  created() {
    this.getRolesData()
  },
  methods: {
    async getRolesData() {
      const { data: res } = await this.$http.get(`${BASE_URL}/roles`)
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg)
        return
      }

      this.rolesData = res.data
      this.total = res.data.length
      this.formateDisplayData()
    },

    async handleAddRole() {
      const valid = await this.$refs.addRoleRef.validate()
      if (!valid) {
        return
      }
      if (this.addRoleFormType === 'edit') {
        const { data: res } = await this.$http.put(
          `${BASE_URL}/roles/${this.roleId}`,
          this.addRoleForm
        )

        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
      } else {
        const { data: res } = await this.$http.post(
          `${BASE_URL}/roles`,
          this.addRoleForm
        )

        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
      }
      this.getRolesData()
      this.addRoleVisible = false
    },
    handleEditRole(row) {
      this.roleId = row.id
      this.addRoleFormType = 'edit'
      this.addRoleForm = {
        roleName: row.roleName,
        roleDesc: row.roleDesc
      }
      this.addRoleVisible = true
    },

    handleAddClosed() {
      this.$refs.addRoleRef.resetFields()
      this.addRoleFormType = 'add'
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
      this.displayData = this.rolesData.slice(
        (this.pagenum - 1) * this.pagesize,
        this.pagenum * this.pagesize
      )
      console.log('displayData', this.displayData)
    },

    async removeRightById(row, rightId) {
      const confirm = await this.$confirm('确认删除该权限？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(() => {
        return this.$message.info('已取消删除!')
      })

      if (confirm === 'confirm') {
        // TODO
        const { data: res } = await this.$http.delete(
          `${BASE_URL}/roles/${row.id}/rights/${rightId}`
        )

        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        // this.getRolesData()
        row.children = res.data
      }
    },

    async openSetRight(row) {
      const { data: res } = await this.$http.get(`${BASE_URL}/rights/tree`)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.rightsTreeData = res.data
      this.rightsCheckedKeys = this.getLeafKeys(row, [])
      this.roleId = row.id
      this.setRightVisible = true
    },

    closedSetRight() {
      this.roleId = ''
    },
    async handleSetRight() {
      const keys = [
        ...this.$refs.rightsTreeRef.getCheckedKeys(),
        ...this.$refs.rightsTreeRef.getHalfCheckedKeys()
      ]
      const rids = keys.join(',')
      const { data: res } = await this.$http.post(
        `${BASE_URL}/roles/${this.roleId}/rights`,
        { rids }
      )
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      this.getRolesData()
      this.setRightVisible = false
    },

    // 递归获取最后的节点
    getLeafKeys(node, arr) {
      if (!node.children) {
        arr.push(node.id)
      } else {
        node.children.forEach((item) => {
          this.getLeafKeys(item, arr)
        })
      }
      return arr
    },

    async deleteRole(row) {
      const confirm = await this.$confirm(
        `确认删除角色 ${row.roleName} ?`,
        '提示',
        {
          cancelButtonText: '取消',
          confirmButtonText: '确定',
          type: 'warning'
        }
      ).catch(() => {
        this.$message.info(`已取消删除角色 ${row.roleName}`)
      })

      if (confirm === 'confirm') {
        const { data: res } = await this.$http.delete(
          `${BASE_URL}/roles/${row.id}`
        )

        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.getRolesData()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 10px;
  margin-bottom: 10px;
}

.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}

.el-tree {
  max-height: 500px;
  overflow-y: auto;
}
</style>
