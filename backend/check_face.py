import face_recognition
import sys

print("✅ เริ่มเปรียบเทียบใบหน้า")

known_path = sys.argv[1]
unknown_path = sys.argv[2]

known_image = face_recognition.load_image_file(known_path)
unknown_image = face_recognition.load_image_file(unknown_path)

try:
    known_encoding = face_recognition.face_encodings(known_image)[0]
    unknown_encoding = face_recognition.face_encodings(unknown_image)[0]

    distance = face_recognition.face_distance([known_encoding], unknown_encoding)[0]
    print("FACE_DISTANCE:", distance)

    matched = distance < 0.6
    print("True" if matched else "False")
except IndexError:
    print("NoFace")
