const generateCommunity = id => {
    return {
        "_id": {'$oid': id},
        "display_name": id,
        "name": id,
        "plural_name": id,
        "icon": "circle",
        "primary_color": "000000",
        "secondary_color": "FFFFFF",
        "primary_fields": [{name: 'price', formatting: 'currency'}, {name: "categories"}],
        "secondary_fields": [{name: 'sample_1'}, {name: "sample_2", label: 'Sample'}],
    }
}

const generateCommunities = (start, quantity) => {
    let i = 0
    let results = [];
    while (i < quantity) {
        results.push(generateCommunity((start + i).toString()));
        i++;
    }
    return results;
};

const generateProducts = (start, quantity) => {
    let i = 0
    let results = [];
    while (i < quantity) {
        results.push({
            "id": (start + i).toString(),
            "display_name": (start + i).toString(),
            "name": (start + i).toString(),
            "brand": "Some Brand",
            "categories": [
                "Category 1",
                "Category 2",
            ],
            "community_id": (i % 2 ? "3" : "6"),
            "image_url": "",
            "price": 30,
            "price_per": "10 servings",
            "sample_1": "1",
            "sample_2": "2",
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
        },
        'communities/3/': {
            "isBase64Encoded": true,
            'statusCode': 200,
            'headers': null,
            'multiValueHeaders': null,
            'data': generateCommunity('3')
        },
        '/products?page=1&size=5&communityId=3': {
            "isBase64Encoded": true,
            'statusCode': 200,
            'headers': null,
            'multiValueHeaders': null,
            'data': {
                'next': null,
                'previous': null,
                'results': generateProducts(1, 25)
            }
        }
    }
};