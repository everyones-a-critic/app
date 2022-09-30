const generateCommunities = (start, quantity) => {
    let i = 0
    let results = [];
    while (i < quantity) {
        results.push({
            "_id": {'$oid': (start + i).toString()},
            "display_name": (start + i).toString(),
            "name": (start + i).toString(),
            "plural_name": (start + i).toString(),
            "icon": "circle",
            "primary_color": "000000",
            "secondary_color": "FFFFFF"
        });
        i++;
    }
    return results;
};

export const mockReturnValues = {
    get: {
        '/communities?page=1': {
            "isBase64Encoded": true,
            'statusCode': 200,
            'headers': null,
            'multiValueHeaders': null,
            'data': {
                'next': '/communities?page=2',
                'previous': null,
                'results': generateCommunities(1, 25)
            }
        },
        '/communities?page=2': {
            "isBase64Encoded": true,
            'statusCode': 200,
            'headers': null,
            'multiValueHeaders': null,
            'data': {
                'next': null,
                'previous': '/communities?page=1',
                'results': generateCommunities(26, 25)
            }
        },
        '/communities?isMember=true&page=1': {
            "isBase64Encoded": true,
            'statusCode': 200,
            'headers': null,
            'multiValueHeaders': null,
            'data': {
                'next': null,
                'previous': null,
                'results': [
                    {"_id": {'$oid': "3"}, "display_name": "3", "name": "3", "plural_name": "3", "icon": "circle", "primary_color": "000000",  "secondary_color": "FFFFFF"},
                    {"_id": {'$oid': "6"},  "display_name": "6", "name": "6", "plural_name": "6", "icon": "circle", "primary_color": "000000",  "secondary_color": "FFFFFF"},
                ]
            }
        },
        'communities/?searchString=test': {
            "isBase64Encoded": true,
            'statusCode': 200,
            'headers': null,
            'multiValueHeaders': null,
            'data': {
                'next': null,
                'previous': null,
                'results': generateCommunities(51, 10)
            }
        }
    }
};