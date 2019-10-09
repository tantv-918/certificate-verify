import { authHeader } from '../_helpers/auth-header.js';
import axios from 'axios';

export const studentService = {
  getAllSubjects,
  registerSubject,
  getMySubjects,
  getMyCertificates
};

async function getAllSubjects() {
  try {
    let respone = await axios.get(`${process.env.VUE_APP_API_BACKEND}/student/all`, {
      headers: authHeader()
    });
    return respone.data.subjects;
  } catch (error) {
    throw error;
  }
}
async function registerSubject(subjectId) {
  try {
    let respone = await axios.post(
      `${process.env.VUE_APP_API_BACKEND}/student/register`,
      { subjectId: subjectId },
      {
        headers: authHeader()
      }
    );
    return respone.data.subjects;
  } catch (error) {
    throw error;
  }
}
async function getMySubjects(username) {
  try {
    let respone = await axios.post(
      `${process.env.VUE_APP_API_BACKEND}/student/mysubjects`,
      { username: username },
      {
        headers: authHeader()
      }
    );
    return respone.data.subjects;
  } catch (error) {
    throw error;
  }
}

async function getMyCertificates(username) {
  try {
    let respone = await axios.post(
      `${process.env.VUE_APP_API_BACKEND}/student/mycertificates`,
      { username: username },
      {
        headers: authHeader()
      }
    );
    return respone.data.subjects;
  } catch (error) {
    throw error;
  }
}
