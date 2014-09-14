import requests

__author__ = 'brandon'
__api_key__ = 'AIzaSyC-gt2L5JtLSDXajBhKil7vtNBwB9oWVis'
__service_url__ = 'https://www.googleapis.com/freebase/v1/search'

def topic(query):
    prms = {
        'query': query,
        'key': __api_key__
    }
    request = requests.get(__service_url__, params=prms).json()
    if not ('result' in request and len(request['result']) > 0 and 'notable' in request['result'][0] and 'id' in request['result'][0]['notable']): return None
    result = request['result'][0]['notable']['id']
    result = result.replace("/", " ").split(" ")[1]
    result = [result, 'Human']['m' == result]
    return result
