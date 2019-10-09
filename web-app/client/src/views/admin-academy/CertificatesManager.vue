<template>
  <div>
    <div class="container-fluid">
      <h1 class="h3 mb-2 text-gray-800">Quản Lý Chứng Chỉ</h1>
      <p class="mb-4 mt-4"></p>
      <div class="card shadow mb-4">
        <div class="card-header py-3">
          <h6 class="m-0 font-weight-bold text-primary">
            <button class="btn btn-success" @click="createSubject" v-b-modal.modal-create>
              <i class="fas fa-plus"></i>
            </button>
          </h6>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <b-table
              show-empty
              stacked="md"
              :items="listSubjects ? listSubjects : []"
              :fields="fields"
              :current-page="currentPage"
              :per-page="perPage"
            >
              <template slot="SubjectID" slot-scope="row">{{ row.item.SubjectID }}</template>

              <template slot="Name" slot-scope="row">{{ row.item.Name }}</template>

              <template slot="delete" slot-scope="row">
                <div class="row justify-content-center">
                  <b-button
                    variant="info"
                    class="mr-1 btn-circle btn-sm"
                    :to="`certificates/${row.item.SubjectID}/students`"
                    :id="`popover-info-${row.item.SubjectID}`"
                  >
                    <b-popover
                      :target="`popover-info-${row.item.SubjectID}`"
                      triggers="hover"
                      placement="top"
                    >Chi Tiết</b-popover>
                    <i class="fas fa-info-circle"></i>
                  </b-button>
                </div>
              </template>
            </b-table>
          </div>

          <b-row>
            <b-col md="6" class="my-1">
              <b-pagination
                :total-rows="listSubjects ? listSubjects.length : 0 "
                :per-page="perPage"
                v-model="currentPage"
                class="my-0"
              />
            </b-col>
          </b-row>
        </div>
      </div>
    </div>

    <b-modal
      :id="infoModal.SubjectID"
      @hide="resetInfoModalEdit"
      ok-title="Update"
      @ok="handleUpdate"
      title="Cập Nhật Môn Học"
    >
      <b-form>
        <b-form-group id="input-group-1" label-for="input-1" class>
          <b-form-input
            id="input-1"
            v-model="form.Name"
            type="text"
            required
            placeholder="subject name *"
          ></b-form-input>
        </b-form-group>
      </b-form>
    </b-modal>

    <b-modal
      id="modal-create"
      title="Tạo Mới Môn Học"
      @ok="handleCreate"
      @cancel="resetInfoModalCreate"
    >
      <b-form-group id="input-group-1" label-for="input-1" class>
        <b-form-input
          id="input-1"
          v-model="newSubject.Name"
          type="text"
          required
          placeholder="subject name *"
        ></b-form-input>
      </b-form-group>
    </b-modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        Name: ""
      },
      newSubject: {
        Name: ""
      },
      infoModal: {
        SubjectID: "info-modal"
      },
      listSubjects: [
        {
          SubjectID: 1,
          Name: "Subject01"
        },
        {
          SubjectID: 2,
          Name: "Subject02"
        },
        {
          SubjectID: 3,
          Name: "Subject03"
        },
        {
          SubjectID: 4,
          Name: "Subject04"
        },
        {
          SubjectID: 5,
          Name: "Subject05"
        },
        {
          SubjectID: 6,
          Name: "Subject06"
        },
        {
          SubjectID: 7,
          Name: "Subject01"
        },
        {
          SubjectID: 8,
          Name: "Subject02"
        },
        {
          SubjectID: 9,
          Name: "Subject03"
        },
        {
          SubjectID: 10,
          Name: "Subject04"
        },
        {
          SubjectID: 11,
          Name: "Subject05"
        },
        {
          SubjectID: 12,
          Name: "Subject06"
        },
        {
          SubjectID: 13,
          Name: "Subject01"
        },
        {
          SubjectID: 14,
          Name: "Subject02"
        },
        {
          SubjectID: 15,
          Name: "Subject03"
        },
        {
          SubjectID: 16,
          Name: "Subject04"
        },
        {
          SubjectID: 17,
          Name: "Subject05"
        },
        {
          SubjectID: 18,
          Name: "Subject06"
        }
      ],
      fields: [
        {
          key: "SubjectID",
          label: "SubjectID",
          class: "text-center",
          sortable: true
        },
        {
          key: "Name",
          label: "Name Subject",
          class: "text-center",
          sortable: true
        },
        {
          key: "delete",
          label: "Actions",
          class: "text-center",
          sortable: true
        }
      ],
      currentPage: 1,
      perPage: 12,
      pageOptions: [12, 24, 36]
    };
  },
  methods: {
    info(item, index, button) {
      this.form.Name = item.Name;
      this.$root.$emit("bv::show::modal", this.infoModal.SubjectID, button);
    },
    resetInfoModalEdit() {
      this.form.Name = "";
    },
    resetInfoModalCreate() {
      this.newSubject.Name = "";
    },
    handleUpdate() {},
    handleCreate() {
      resetInfoModalCreate();
    },
    deleteSubject(item) {
      this.$swal({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        type: "warning",
        showCancelButton: true,
        cancelButtonColor: "#d33",
        confirmButtonColor: "#28a745",
        confirmButtonText: "Yes, delete it!",
        reverseButtons: true
      }).then(result => {
        if (result.value) {
          this.$swal("Deleted!", "Your file has been deleted.", "success");
        }
      });
    },
    createSubject(item, button) {
      this.$root.$emit("bv::show::modal", button);
    }
  }
};
</script>
