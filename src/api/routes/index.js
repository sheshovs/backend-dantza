import express from "express";
import S3Controller from "../modules/S3/S3.controller.js";
import ImageController from "../modules/Image/image.controller.js";
import AuthController from "../modules/Auth/auth.controller.js";
import DisciplineController from "../modules/Discipline/discipline.controller.js";
import TeacherController from "../modules/Teacher/teacher.controller.js";

const router = express.Router();

// S3
// router.route('/s3/upload').put(S3Controller.upload);

// Image
router.route('/image/upload').post(ImageController.upload);

// Auth
router.route('/auth/login').post(AuthController.Login);
router.route('/auth/current').get(AuthController.CurrentUser);

// Discipline
router.route('/discipline').post(DisciplineController.Create);
router.route('/discipline').get(DisciplineController.GetAll);
router.route('/discipline/:uuid').get(DisciplineController.GetByUuid);

// Teacher
router.route('/teacher').post(TeacherController.Create);
router.route('/teacher').get(TeacherController.GetAll);
router.route('/teacher/:uuid').get(TeacherController.GetByUuid);

export default router;