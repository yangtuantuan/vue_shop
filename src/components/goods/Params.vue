<template>
  <div>
    <el-breadcrumb>
      <el-breadcrumb-item :to="'/home'">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert
        show-icon
        title="注意：只允许为三级分类设置相关参数！"
        type="warning"
      >
      </el-alert>
      <div style="margin-top: 10px">
        <span>选择商品分类：</span>
        <el-cascader
          :options="cateData"
          :props="cascaderProps"
          clearable
          show-all-levels
          v-model="cateSelectedKeys"
          @change="cateSelectChange"
        >
        </el-cascader>
      </div>
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            :disabled="isBtnDisabled"
            type="primary"
            @click="openAddParams"
          >
            添加{{paramsType}}
          </el-button>
          <params-table
            :data="manyTableData"
            @handleDeleteParams="handleDeleteParams"
            @openEidt="openEidt"
          ></params-table>
        </el-tab-pane>
        <el-tab-pane label="静态参数" name="only">
          <el-button
            :disabled="isBtnDisabled"
            type="primary"
            @click="openAddParams"
          >
            添加{{paramsType}}
          </el-button>
          <params-table
            :data="onlyTableData"
            @handleDeleteParams="handleDeleteParams"
            @openEidt="openEidt"
          ></params-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 编辑添加弹窗 -->
    <el-dialog
      width="40%"
      modal
      @closed="addDialogClosed"
      :visible.sync="addDialogVisible"
      :close-on-click-modal="false"
      :title="(addFormType === 'edit' ? '编辑' : '添加') + paramsType"
    >
      <el-form
        :model="addForm"
        label-width="100px"
        :rules="addFormRules"
        ref="addFormRef"
      >
        <el-form-item prop="attr_name" :label="paramsType + '名'">
          <el-input
            v-model="addForm.attr_name"
            :auto-complete="'off'"
            :placeholder="'请输入' + paramsType + '名'"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="参数">
          <el-tag
            closable
            @close="handleCloseTag(i)"
            v-for="(tag, i) in attrValList(addForm.attr_vals)"
            :key="i"
          >
            {{ tag }}
          </el-tag>
          <el-input
            class="input-new-tag"
            v-if="addInputVisible"
            v-model="addInputValue"
            ref="saveAddTagInput"
            size="small"
            @keyup.enter.native="handleInputConfirm"
            @blur="handleInputConfirm"
          >
          </el-input>
          <el-button
            v-else
            class="button-new-tag"
            size="small"
            @click="showAddTagInput"
            >+ New Tag</el-button
          >
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button
          @click="
            addFormType === 'edit' ? handleSaveParams() : handleAddParams()
          "
          type="primary"
          >确定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { BASE_URL } from '@/config/config'
import ParamsTableVue from './ParamsTable.vue'
export default {
  components: {
    'params-table': ParamsTableVue
  },
  data() {
    return {
      addDialogVisible: false,
      cateSelectedKeys: '',
      activeTab: 'many',
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      cateData: [],
      manyTableData: [],
      onlyTableData: [],
      addFormType: 'add',
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [
          { required: true, trigger: 'blur', message: '请输入参数名' }
        ],
        attr_vals: ''
      },
      attrId: '',
      addInputVisible: false,
      addInputValue: ''
    }
  },
  mounted() {
    this.getCateData()
  },
  computed: {
    isBtnDisabled() {
      if (this.cateSelectedKeys.length === 3) {
        return false
      }
      return true
    },
    cateId() {
      if (this.cateSelectedKeys.length === 3) {
        return this.cateSelectedKeys[2]
      }
      return null
    },
    paramsType() {
      if (this.activeTab === 'many') {
        return '动态参数'
      }
      return '静态参数'
    }
  },
  methods: {
    async getCateData() {
      const { data: res } = await this.$http.get(`${BASE_URL}/categories`)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.cateData = res.data
      console.log('cateData', this.cateData)
    },

    async getParamsData() {
      if (this.cateSelectedKeys.length !== 3) {
        this.cateSelectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      const { data: res } = await this.$http.get(
        `${BASE_URL}/categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeTab }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      if (this.activeTab === 'many') {
        this.manyTableData = res.data
      } else if (this.activeTab === 'only') {
        this.onlyTableData = res.data
      }
    },

    cateSelectChange() {
      // 获取对应表格数据
      this.getParamsData()
    },

    handleTabClick() {
      this.getParamsData()
    },

    openEidt(row) {
      this.addFormType = 'edit'
      this.attrId = row.attr_id
      this.addForm = {
        attr_name: row.attr_name,
        attr_sel: this.activeTab,
        attr_vals: row.attr_vals
      }
      this.addDialogVisible = true
    },

    async handleCloseTag(i) {
      const vals = this.attrValList(this.addForm.attr_vals)
      vals.splice(i, 1)
      this.addForm.attr_vals = vals.join(',')
    },
    async handleSaveParams() {
      const { data: res } = await this.$http.put(
        `${BASE_URL}/categories/${this.cateId}/attributes/${this.attrId}`,
        this.addForm
      )
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      this.$refs.addFormRef.resetFields()
      this.addDialogVisible = false
      this.getParamsData()
    },
    async handleDeleteParams(row) {
      const confirm = await this.$confirm(
        `确认删除${this.paramsType} ${row.attr_name} 吗？`,
        '提示',
        {
          type: 'warning',
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }
      ).catch(() => {
        this.$message.info(`已取消删除${this.paramsType} ${row.attr_name}`)
      })
      if (confirm === 'confirm') {
        const { data: res } = await this.$http.delete(
          `${BASE_URL}/categories/${row.cat_id}/attributes/${row.attr_id}`
        )
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.getParamsData()
      }
    },

    openAddParams() {
      if (this.activeTab === 'many') {
        this.addForm = {
          attr_name: '',
          attr_sel: 'many',
          attr_vals: ''
        }
      } else if (this.activeTab === 'only') {
        this.addForm = {
          attr_name: '',
          attr_sel: 'only'
        }
      }
      this.addFormType = 'add'
      this.addDialogVisible = true
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
      this.addFormType = 'add'
      this.addInputVisible = false
      this.addInputValue = ''
      this.attrId = ''
    },
    async handleAddParams() {
      const valid = await this.$refs.addFormRef.validate().catch((err) => {
        return err
      })
      if (valid) {
        const { data: res } = await this.$http.post(
          `${BASE_URL}/categories/${this.cateId}/attributes`,
          this.addForm
        )
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
      } else {
        return
      }
      this.addDialogVisible = false
      this.getParamsData()
    },
    attrValList(vals) {
      return vals ? vals.split(',') : []
    },
    showAddTagInput() {
      this.addInputVisible = true
      this.$nextTick((_) => {
        this.$refs.saveAddTagInput.$refs.input.focus()
      })
    },
    handleInputConfirm() {
      if (!this.addInputValue) {
        return
      }
      if (this.addForm.attr_vals) {
        this.addForm.attr_vals += ',' + this.addInputValue
      } else {
        this.addForm.attr_vals = this.addInputValue
      }
      this.addInputValue = ''
      this.addInputVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tabs {
  margin-top: 10px;
}

.el-cascader {
  width: 350px;
}

.el-table {
  margin-top: 10px;
}

.el-tag {
  margin-right: 10px;
}

.button-new-tag {
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  margin-left: 10px;
  width: 150px;
  vertical-align: bottom;
}
</style>
