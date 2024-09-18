from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from pymongo import MongoClient
import pandas as pd

app = Flask(__name__)
app.secret_key = 'your_secret_key'

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        uri = request.form['uri']
        db_name = request.form['db_name']
        collection_name = request.form['collection_name']
        
        if 'file' not in request.files:
            flash('파일이 선택되지 않았습니다.')
            return redirect(request.url)
        
        file = request.files['file']
        
        if file.filename == '':
            flash('파일이 선택되지 않았습니다.')
            return redirect(request.url)
        
        if file and file.filename.endswith('.xlsx'):
            # 엑셀 파일의 첫 행을 필드 이름으로 사용하고, 두 번째 행부터 데이터로 읽습니다.
            df = pd.read_excel(file, header=0)
            
            if df.empty:
                flash('엑셀 파일이 비어있습니다.')
                return redirect(request.url)
            
            empty_rows = df[df.isnull().any(axis=1)]
            if not empty_rows.empty:
                flash(f'빈 데이터가 있습니다! 행 번호: {empty_rows.index.tolist()}')
                return redirect(request.url)
            
            try:
                client = MongoClient(uri)
                db = client[db_name]
                collection = db[collection_name]
                
                records = df.to_dict('records')
                collection.insert_many(records)
                
                flash('데이터가 성공적으로 업로드되었습니다.')
                return redirect(url_for('result'))
            except Exception as e:
                flash(f'오류 발생: {str(e)}')
                return redirect(request.url)
        else:
            flash('올바른 엑셀 파일(.xlsx)을 선택해주세요. 첫 행은 필드 이름이어야 하며, 두 번째 행부터 데이터가 들어가야 합니다.')
            return redirect(request.url)
    
    return render_template('index.html')

@app.route('/get_databases', methods=['POST'])
def get_databases():
    uri = request.form['uri']
    try:
        client = MongoClient(uri)
        databases = client.list_database_names()
        return jsonify({"databases": databases})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/get_collections', methods=['POST'])
def get_collections():
    uri = request.form['uri']
    db_name = request.form['db_name']
    try:
        client = MongoClient(uri)
        db = client[db_name]
        collections = db.list_collection_names()
        return jsonify({"collections": collections})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/result')
def result():
    return render_template('result.html')

@app.route('/delete', methods=['GET', 'POST'])
def delete():
    if request.method == 'POST':
        uri = request.form['uri']
        db_name = request.form['db_name']
        collection_name = request.form['collection_name']
        field_name = request.form['field_name']
        field_value = request.form['field_value']
        
        try:
            client = MongoClient(uri)
            db = client[db_name]
            collection = db[collection_name]
            
            result = collection.delete_many({field_name: field_value})
            
            flash(f'삭제된 문서 수: {result.deleted_count}', 'success')
            return redirect(url_for('result'))
        except Exception as e:
            flash(f'오류 발생: {str(e)}', 'danger')
            return redirect(url_for('delete'))
    
    return render_template('delete.html')

@app.route('/get_fields', methods=['POST'])
def get_fields():
    uri = request.form['uri']
    db_name = request.form['db_name']
    collection_name = request.form['collection_name']
    try:
        client = MongoClient(uri)
        db = client[db_name]
        collection = db[collection_name]
        # 컬렉션의 첫 번째 문서를 가져와 필드 이름을 추출합니다
        sample_doc = collection.find_one()
        fields = list(sample_doc.keys()) if sample_doc else []
        return jsonify({"fields": fields})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)