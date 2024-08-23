import cv2

#TODO:
#---------------------------
# REFACTOR CODE TO A BETTER STRUCTURE AND FASTER ALGORITHM
#---------------------------
# Add yolov5.lite for detection of cars 
#---------------------------
# Use and Add Sql-Lite database for the detection of cars and its corresponding height and width
#---------------------------

known_distance = 30 #inches
known_width = 5.7 #inches

# Camera Interface designs ---------
# main colors needed <<<<<<<<<
GREEN = (0, 255, 0)
YELLOW = (0, 255, 255)
RED = (0, 0, 255)
# >>>>>>>>>>>>>>>>>>>>>>>>>>>>

#misc colors <<<<<<<<<<<<<<<<<
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
CYAN = (255, 255, 0)
MAGENTA = (255, 0, 242)
GOLDEN = (32, 218, 165)
LIGHT_BLUE = (255, 9, 2)
PURPLE = (128, 0, 128)
CHOCOLATE = (30, 105, 210)
PINK = (147, 20, 255)
ORANGE = (0, 69, 255)
# >>>>>>>>>>>>>>>>>>>>>>>>>>>>

#FONTS <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
fonts = cv2.FONT_HERSHEY_COMPLEX
fonts2 = cv2.FONT_HERSHEY_SCRIPT_SIMPLEX
fonts3 = cv2.FONT_HERSHEY_COMPLEX_SMALL
fonts4 = cv2.FONT_HERSHEY_TRIPLEX
#>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

# Declare Camera Object
cap = cv2.VideoCapture(0)  # Number According to your Camera
Distance_level = 0

#TODO: Learn topics that are not familiar here --------------
#HACK: To learn about this topic..
# Define the codec and create VideoWriter object
fourcc = cv2.VideoWriter_fourcc(*"XVID") #CODED
out = cv2.VideoWriter ("./src/output.mp4", fourcc, 30.0, (640, 480))


#HACK: Learn about how this work
# face detector object
face_detector = cv2.CascadeClassifier("./src/haarcascade_frontalface_default.xml")
#----------------------------------------------------------

#NOTE: MAIN FORMULAS 

#<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
def FocalLength(measured_distance, real_width, width_in_rf_image):
    focal_length = (width_in_rf_image * measured_distance) / real_width
    return focal_length

def Distance_finder(Focal_Length, real_face_width, face_width_in_frame):
    distance = (real_face_width * Focal_Length) / face_width_in_frame
    return distance
#<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

#NOTE: UI/UX Components

#<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
def WarningMessage():
    
    # Define the text to display
    text = "DANGER"

    #Warning SETTINGS and PARAMETERS
    font_scale = 1
    font_color = (RED)  # Red color in BGR
    thickness = 2
    line_type = cv2.LINE_AA

    # Set text position (upper-left corner)
 
    # Get the text size to position it correctly
    # text_size, _ = cv2.getTextSize(text, fonts, font_scale, thickness)
    text_x = 10
    text_y = 30  # Adjust to ensure the text is within the frame


    # Put the text on the frame
    cv2.putText(frame, text, (text_x, text_y), fonts, font_scale, font_color, thickness, line_type)
 

def face_data(image, CallOut, Distance_level):
    face_width = 0
    face_x, face_y = 0, 0
    face_center_x = 0
    face_center_y = 0
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = face_detector.detectMultiScale(gray_image, 1.3, 5)


    #Settings to change the color of the box around the face
    for (x, y, w, h) in faces:
        line_thickness = 5
        LLV = int(h * 0.12) #print(len(faces))
        
        if (Distance_level >= 40):
            #<<<<<<<<<<<<<<<<<< (printing of good line)
            cv2.rectangle(image, (x, y), (x+w, y+h), GREEN, line_thickness)
            #<<<<<<<<<<<<<<<<<<
        elif (Distance_level <= 39 & Distance_level > 20): 
            #<<<<<<<<<<<<<<<<<< (printing of good line)
            cv2.rectangle(image, (x, y), (x+w, y+h), YELLOW, line_thickness)
            #<<<<<<<<<<<<<<<<<<
        elif (Distance_level <= 20): 
            #<<<<<<<<<<<<<<<<<< (printing of good line)
            cv2.rectangle(image, (x, y), (x+w, y+h), RED, line_thickness)
            #<<<<<<<<<<<<<<<<<<
        
        face_width = w
        face_center = []
        face_center_x = int(w/2) + x
        face_center_y = int(h/2) + y

        if Distance_level < 10:
            Distance_level = 10
            
        if CallOut == True: 
            cv2.line(image, (x, y - 11), (x + 180, y - 11), (ORANGE), 28)
            cv2.line(image, (x, y - 11), (x + 180, y - 11), (YELLOW), 20)
            cv2.line(image, (x, y - 11), (x + Distance_level, y - 11), (GREEN), 18)

    return face_width, faces, face_center_x, face_center_y

#>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


ref_image = cv2.imread("./src/reference_images.jpg")

ref_image_face_width, _, _, _ = face_data(ref_image, False, Distance_level)

Focal_length_found = FocalLength(known_distance, known_width, ref_image_face_width)
print(Focal_length_found)


while True:
    _, frame = cap.read()
    # calling face_data function
    # Distance_level = 0;
    
    face_width_in_frame, faces, FC_X, FC_Y = face_data(frame, True, Distance_level)

    for (face_x, face_y, face_w, face_h) in faces:
        if face_width_in_frame != 0:

            Distance = Distance_finder(
                Focal_length_found, known_width, face_width_in_frame
            )

            Distance = round(Distance, 2)
            #Render the texts of the screen
            Distance_level = int(Distance)
            
            if (Distance <= 39):
                WarningMessage();
                cv2.putText(
                    frame,
                    f"DANGER!: {Distance} Inches",
                    (face_x - 6, face_y - 6),
                    fonts, 
                    0.5,
                    (RED),
                    2,
                )
            else:
                cv2.putText(
                    frame,
                    f"Distance {Distance} Inches",
                    (face_x - 6, face_y - 6),
                    fonts, 
                    0.5,
                    (BLACK),
                    2,
                )

    cv2.imshow("frame", frame)
    out.write(frame)
    
    if cv2.waitKey(1) == ord("q"):
        break;

cap.release()
#delete all windows and stop
cap.destroyAllWindows()

