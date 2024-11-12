import React from "react";
import { Routes, Route } from "react-router-dom";
import Address from "./pages/UserInputForm/Address";
import ContextImageChat from "./pages/UserInputForm/ContextImageChat";
import ImageUploadLayout from "./pages/UserInputForm/ImageUploadLayout";
import OrderTrackingWeb from "./pages/UserInputForm/OrderTrackingWeb";
import PreviewQuestions from "./pages/UserInputForm/PreviewQuestions";
import ReAskChat from "./pages/UserInputForm/ReAskChat";
import ReviewChat from "./pages/UserInputForm/ReviewChat";
import ReviewReq from "./pages/UserInputForm/ReviewReq";
import Revision from "./pages/UserInputForm/Revision";
import TagImages from "./pages/UserInputForm/TagImages";
import UserForm from "./pages/UserInputForm/UserForm";
import UserImage from "./pages/UserInputForm/UserImage";
import UserInputFormLayout from "./pages/UserInputForm/UserInputFormLayout";

function App() {
  return (
    <Routes>
      {/* Wrapper Layout Route */}
      <Route path="userform" element={<UserInputFormLayout />}>
        {/* Main User Form Route */}
        <Route path="question/:orderId" element={<UserForm />} />

        {/* Image Upload Route */}
        <Route path="upload-images/:orderId" element={<ImageUploadLayout />} />

        {/* Shipping Address Route */}
        <Route path="ship-address/:orderId" element={<Address />} />

        {/* Nested Routes under UserImage */}
        <Route path="" element={<UserImage />}>
          <Route
            path="order-tracking/:orderId"
            element={<OrderTrackingWeb />}
          />
          <Route path="preview/:orderId" element={<PreviewQuestions />} />
          <Route path="revision/:orderId" element={<Revision />} />
          <Route path="order-review/:orderId" element={<ReviewChat />} />
          <Route path="review-request/:orderId" element={<ReviewReq />} />
          <Route path="tag-images/:orderId" element={<TagImages />} />
          <Route path="context-image/:orderId" element={<ContextImageChat />} />
          <Route path="re-ask/:orderId" element={<ReAskChat />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
