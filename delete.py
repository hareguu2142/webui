from pymongo import MongoClient

# MongoDB URI를 사용하여 연결
uri = "mongodb+srv://puzzle2:puzzle2@cluster0.3bfxg.mongodb.net/pages?retryWrites=true&w=majority"
client = MongoClient(uri)

# 데이터베이스와 컬렉션 선택
db = client['pages']  # 'pages' 데이터베이스 선택
collection = db['HoMe']  # 'HoMe' 컬렉션 선택

# 필드 content의 값이 "b"인 문서 삭제
result = collection.delete_many({"content": "b"})

# 삭제된 문서 수 출력
print(f"Deleted {result.deleted_count} documents.")
