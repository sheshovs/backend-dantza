import express from "express";
import S3Controller from "../modules/S3/S3.controller.js";
import ImageController from "../modules/Image/image.controller.js";

const router = express.Router();

// S3
// router.route('/s3/upload').put(S3Controller.upload);

// Image
router.route('/image/upload').post(ImageController.upload);

// // Auth
// router.route('/auth/login').post(AuthController.Login);
// router.route('/auth/current').get(AuthController.CurrentUser);
// // Orders
// router.route('/orders').get(OrderController.GetOrders);
// router.route('/order/:orderId').get(OrderController.GetOrder);
// router.route('/orderWithEvents').post(OrderController.CreateOrderWithEvents);
// // Rooms
// router.route('/rooms').get(RoomController.GetRooms)

export default router;