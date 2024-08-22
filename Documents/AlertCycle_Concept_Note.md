# Concept Notes

## BU Thematic Area

### **Theme 2: Climate Change Adaptation and Disaster Risk Reduction (CC & DRR)**

This research on enhancing bike safety through an AI-driven auditory and alert system aligns with _Theme 2: Disaster Risk Reduction_ by implementing proactive measures to mitigate road traffic accidents, bolstering road safety infrastructure, and safeguarding vulnerable road users. By employing a sensor-based system, cyclists are informed to the presence of nearby vehicles, and alerted when vehicles behind approach too closely, posing a potential hazard or intending to overtake at an unsafe distance. The system ensures timely alerts, enhancing the biker's awareness and safety on the road.

The system effectively reduces the likelihood and severity of accidents, contributing to overall disaster risk reduction efforts. Moreover, by integrating innovative technology into road bike safety initiatives, the research enhances the resilience of bike transportation systems in urban environments. Through these concerted efforts, the research not only addresses the immediate challenges of road bike safety but also lays the groundwork for building more resilient communities capable of adapting to and mitigating the impacts of disasters associated with road traffic accidents.

## Proposed Title

### **_Alert Cycle:_** **Enhancing Bike Safety through an AI-Driven Alert Device for Vehicle Awareness and Detection.**

## Rationale

The increasing prevalence of bicycles on roadways alongside motor vehicles necessitates innovative safety solutions to mitigate accidents and enhance cyclist awareness. Reliance on vision alone may not effectively alert cyclists to potential dangers due to blind spots and distractions. Hence, the integration of AI-driven auditory alerts presents a promising avenue to bolster bike safety by providing real-time notifications of approaching vehicles and potential close proximity overtaking maneuvers.

## Objectives

1. **System Design and Implementation.**

   To Design and develop hardware and software components of the auditory alert system, including sensors, signal processing algorithms, robust hardware components to withstand biking environment, graphical user-interface, and alert emission mechanisms.

2. **Model Training.**

   To train an AI model that effectively detects objects the rear vicinity of bicycle, including vehicles and people.

3. **Performance Testing and Evaluation.**

   To determine the effectiveness and percision of the auditory alert system in detecting and notifying cyclists when a vehicle is in dangerous proximity or is nearby.

## Methodology

### I. **System Design and Implementation.**

**A. Hardware**:

- Functionality: The researchers are to design a hardware composed of components that are neccesasry to the device such as

  - **_Ultrasonic sensors_**, for short-range proximity detection.

  - **_Wide Angle Camera_**, for the object detection and real-time visual tracking for the user's front panel

  - **_Raspberry Pi (Microprocessor)_**, for the embedded system that will handle the AI model that the Researchers will be training

  - **_Wifi/Hotspot Adapter (BUILT-IN inside the Raspberry Pi 4 system)_**, for the sending the of live-feed from the camera to the android phone of the user where our application will be placed for the user to control the device.

  - **_Audio Output Device (Speaker)_**, this will emmit the sound needed for hazardous situation that the biker might encounter in its rear.

  - **_Robust Casing_**, for the device to withstand the harsh environment that the road gives to the biker.

**B. Software**:

The researchers are to design a software that will be integrated both to the device, where the AI model is placed and the user's phone, where the device can be controlled and manipulated.

1. **_Android Application:_**,

   - **Functionality:** The role of the android application is to view video-feed given by the device in real-time, this can help with reducing the user's head movement while being able to see the rear view of the bicycle while moving.

   - **Development Tools:**

     - **FlutterFlow.** The Researchers will be using flutterflow in designing the Graphic User Interface of the application.
     - **Android Studio** The Researchers will use the Android Studio Tool Kit to compile and build the overall Application for the Android App.

2. **_AlertCycle Device_**:

   - **Functionality:** The Device will have its own isolated system from the Android Application. The device will be main product of the study, the researchers and to build this, the researchers require the following:

   - **Development Tools:**

     - **Raspberry Pi OS.** The researchers will be using the Raspberry Pi's integrated OS to program it to run the ai model that will be trained.

     - **TensorFlow Lite.** The researchers will be using TensorFlow Lite to train the AI model's Object Detection.

     - **Laptop with GPU.** To efficiently train the AI model, the GPU will be needed to increase the power of training the model and compressing the model.

### II. **AI Model Training.**

In training the AI Model, the researchers will be using TensorFlow Lite, a light-weight version of TensorFlow. TensorFlow is a free and open-source software library for machine learning and artificial intelligence. It can be used across a range of tasks but has a particular focus on training and inference of deep neural networks, while TensorFlow Lite (TFLite) is a collection of tools to convert and optimize TensorFlow models to run on mobile and edge devices.

- **Data Acquisition and Preprocessing:**

  - **Data Gathering:**

    - Collect image data sets of different road objects such as, vehicles, signs, and people. This can also be done via browsing through existing open-source models with road data sets.

  - **Preprocess data:**

    - Resize images to a consistent resolution suitable for TensorFlow Lite.

    - Augment the data using techniques like flipping, rotation, and color adjustments to increase diversity and improve generalization.

- **Model Training and Optimization:**

  - **Choosing an open-source pre-trained model:**

    - Leveraging pre-trained object detection models available on GitHub repositories can significantly expedite the research process. This approach enables the researchers to bypass the time-intensive steps of building a model from scratch, maximizing efficiency and ensuring alignment with established industry practices.

  - **Fine-tune the model:**

    - After finishing setting up the model and its data, the researchers can fine-tune the model to achieve consistency, stability, and percision.

    - The model will be further refined to recognize the designated safe distance for the cyclist, enhancing its ability to provide accurate hazard notifications.

  - **Optimize for performance:**

    - The researchers will employ techniques such as quanitization, and pruning to reduce model size and computanional cost for efficient deployment on Raspberry Pi 4.

### III. **Performance Testing and Evaluation.**

Once the AI model has been trained and optimized, the researchers next step is to rigorously evaluate its performance before real-world deployment. This ensures the device can accurately detect potential hazards and effectively protect cyclists on the road. This section outlines the various testing methods employed to assess the model's capabilities:

- **F1 Score:**

  - Evaluate the model's performance using the F1 score metric, which balances precision and recall, providing a comprehensive measure of object detection accuracy.

- **Additional Metrics:**

  - Consider incorporating other relevant metrics like mean Average Precision (mAP) for a more detailed analysis of the model's ability to detect different object types.

- **Independent Test Set:**

  - To ensure unbiased evaluation, utilize a separate, unseen data set specifically dedicated for testing the trained model. This data set should represent the diverse range of real-world scenarios the model will encounter in deployment.

  - Evaluate the model's performance on this independent test set using the chosen metrics like F1 score and mAP.

- **Real-world Testing:**
  - Conduct real-world testing on diverse road scenarios to assess the model's generalizability and effectiveness in practical applications.

## Expected Output

#### Prototype of a functional Alert Cycle device:

- **Hardware:**
  - Compact and durable casing to withstand biking conditions.
  - Ultrasonic sensors for short-range proximity detection.
  - Wide-angle camera for rear-view object detection.
  - Raspberry Pi 4 as the central processing unit.
  - Wi-Fi/Hotspot adapter for live video feed transmission to the Android app.
  - Audio output device for hazard alerts.
- **Software:**
  - Android application for real-time video feed viewing and device control.
  - Alert Cycle device firmware running on Raspberry Pi OS.
  - Trained AI model for object detection and distance estimation.
- **Performance:**
  - Accurate and timely detection of vehicles and other potential hazards in the cyclist's rear vicinity.
  - Effective audible alerts warning cyclists of potential dangers based on proximity and estimated risk.
  - User-friendly Android application interface for easy control and monitoring.

#### Potential impact:

- Increased safety for cyclists by reducing the risk of collisions with vehicles.
- Enhanced awareness of potential hazards on the road.
- Improved confidence and comfort for cyclists, promoting more sustainable transportation choices.
- Contribution to the development of innovative safety technologies for vulnerable road users.

#### OverAll Expected Output:

- This research aims to integrate the power of artificial intelligence, a technology increasingly used in modern vehicles, to enhance the safety of cyclists on the road. By integrating AI-driven hazard detection and awareness systems into a dedicated device, the project seeks to mitigate the inherent risks associated with cycling in challenging road environments.

#### Figures/Infographs:

<div>

</p>
<b>
Basic Working of Alert Cycle
</b>
<p>

</div>

<div class="basicworkingfigures" align="center" style="text-align:center" >
<table>
<tr>
<th>Safe Distance</th>
<th>Unsafe Distance</th>
</tr>
<td>

![Figure 1: Basic Working of AC](/Figures/Basic_Working_of_AC_OBSERVATIONMODE.png)

<p>Figure 1.0</p>

</td>
<td>

![Figure 1: Basic Working of AC](/Figures/Basic_Working_of_AC_ALERTMODE.png)

<p>Figure 1.1</p>

</td>
</tr>
</table>
</div>

<div>

</p>
<b>
Example of Object Detection on Busy Road
</b>
<p>

![Figure 1: Basic Working of AC](/Figures/object_Detection_example.png)

</div>
