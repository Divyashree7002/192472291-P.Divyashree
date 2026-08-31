# SmartSpace AI - Metric Depth Estimation & 3D Spatial Reconstruction (Phase 5)

## 1. Overview & Objectives

Phase 5 of **SmartSpace AI** introduces **Metric Monocular Depth Estimation**, **RANSAC Room Plane Fitting**, and **3D Spatial Reconstruction**. This transforms 2D camera frames and user room priors into a calibrated 3D geometric representation suitable for downstream architectural layouts and 3D Studio inspection.

---

## 2. Monocular Depth Estimation Architecture

### Pipeline Flow
1. **Perspective Ground-Plane Gradient**: Computes vanishing depth disparity ($Z_{\text{rel}} \propto 1 / y_{\text{horizon}}$) based on camera tilt and horizontal perspective convergence.
2. **Bilateral Disparity & Edge Layering**: Distance transform along Canny structural boundaries to model occlusion depth layers.
3. **Luminance Falloff Prior**: Models indoor light dissipation from ambient and ceiling illumination.
4. **Colormap Normalization**: Outputs normalized relative depth in $[0.0, 1.0]$ and encodes an Inferno/Magma colormap visualization (`data:image/jpeg;base64,...`) for instant browser rendering.

---

## 3. Monocular Scale Ambiguity & Metric Calibration

> [!IMPORTANT]
> **Scale Ambiguity Principle**: A single 2D RGB image contains inherent scale ambiguity (a small object near the lens produces the exact same projection as a large object far away).
>
> In Phase 5, SmartSpace AI resolves scale ambiguity by combining:
> 1. **User Calibration Priors**: Room Length ($L$), Width ($W$), and Ceiling Height ($H$) provided in the room parameters panel.
> 2. **Camera Elevation Prior**: Standard handheld camera elevation height ($h_{\text{cam}} \approx 1.4\text{m}$).
> 3. **Metric Scale Factor ($S$)**: Scales normalized relative depth to calibrated real-world meters ($Z_m = d_{\text{rel}} \cdot S$).

---

## 4. RANSAC 3D Plane Fitting

Point cloud back-projection from calibrated depth maps into camera coordinate space:
$$X = \frac{(u - c_x) \cdot Z}{f_x}, \quad Y = \frac{(v - c_y) \cdot Z}{f_y}, \quad Z = Z$$

The RANSAC plane fitting algorithm iteratively samples point triplets to estimate 3D plane equations $ax + by + cz + d = 0$:
- **Floor Plane**: Normal vector $\hat{n} \approx [0, 1, 0]$ (upward facing), located in lower field of view.
- **Ceiling Plane**: Normal vector $\hat{n} \approx [0, -1, 0]$ (downward facing), located overhead.
- **Primary Wall (Facing/North)**: Normal vector $\hat{n} \approx [0, 0, -1]$.
- **Lateral Walls (East/West)**: Normal vectors $\hat{n} \approx [\pm 1, 0, 0]$.

---

## 5. 3D Object Spatial Localization

For each detected 2D object bounding box from Phase 4:
1. Samples depth map values across the bounding box centroid and interior footprint to compute $Z_{\text{object}}$.
2. Back-projects 2D image coordinates to 3D metric coordinates $(X_m, Y_m, Z_m)$ in meters.
3. Computes estimated physical bounding volume ($W_m \times H_m \times D_m$), distance from camera, and circulation clearance radius.

---

## 6. Endpoints Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `POST /api/estimate-depth` | `multipart/form-data` | Computes monocular relative depth map and returns Inferno colormap visualization. |
| `POST /api/reconstruct-room` | `multipart/form-data` | Fits RANSAC 3D room planes and computes metric spatial dimensions and 3D object positions. |
| `POST /api/analyze-room` | `multipart/form-data` | End-to-end unified execution (Quality + YOLO detection + Depth + RANSAC planes + Metric 3D reconstruction). |
| `GET /api/health` | None | Returns backend status, Phase 5 capabilities, and feature list. |
