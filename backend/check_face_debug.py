import face_recognition

# โหลดภาพใบหน้าที่ลงทะเบียนไว้
known_image = face_recognition.load_image_file("Thanwa.jpg")  # ภาพที่คุณส่ง
# โหลดภาพที่ถ่ายจากกล้องหน้าเว็บ (เปลี่ยน path ตามจริง)
unknown_image = face_recognition.load_image_file("temp-login.jpg")

try:
    known_encoding = face_recognition.face_encodings(known_image)[0]
    unknown_encoding = face_recognition.face_encodings(unknown_image)[0]

    # คำนวณระยะห่าง (face distance)
    face_distance = face_recognition.face_distance([known_encoding], unknown_encoding)[0]
    threshold = 0.6  # ยิ่งน้อยยิ่งแม่น

    print(f"Face Distance: {face_distance}")
    print("Match?" , face_distance < threshold)

except IndexError:
    print("⚠️ ไม่สามารถตรวจจับใบหน้าได้ในภาพใดภาพหนึ่ง")
