import { authHeader } from '../_helpers/auth-header.js';
import axios from 'axios';

export const teacherService = {
  getAllSubjects,
  getStudentsOfSubject,
  setPointForStudent
};

async function getAllSubjects() {
  let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/account/me/subject`, {
    headers: authHeader()
  });
  return respone.data;
}
async function getStudentsOfSubject(subjectId) {
  let respone = await axios.get(
    `${process.env.VUE_APP_API_BACKEND}/subject/${subjectId}/students`,
    {
      headers: authHeader()
    }
  );
  return respone.data;
}

async function setPointForStudent(subjectId, username, ponit) {
  let respone = await axios.get(
    `${process.env.VUE_APP_API_BACKEND}/score/create`,
    {
      subjectId: subjectId,
      studentusername: username,
      scorevalue: ponit
    },
    {
      headers: authHeader()
    }
  );
  return respone.data;
}
