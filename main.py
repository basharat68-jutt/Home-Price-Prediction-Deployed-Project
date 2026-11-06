import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Annotated, Literal
from fastapi.middleware.cors import CORSMiddleware

model = joblib.load('House_Price_Prediction.pkl')

top_cities = ['Shoreline',
 'Seattle',
 'Kent',
 'Bellevue',
 'Redmond',
 'other',
 'Sammamish',
 'Auburn',
 'Federal Way',
 'Kirkland',
 'Issaquah',
 'Woodinville',
 'Renton']


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

#Pydantic Model
class dict(BaseModel):
    bedrooms : Annotated[float, Field(...,description='Number of Bedrooms in House', examples=['5'])]
    bathrooms : Annotated[float, Field(...,description='Number of Bathrooms in House', examples=['7'])]
    sqft_living : Annotated[int, Field(...,description='Living Area in  Square Fit',examples=['1850'])]
    sqft_lot : Annotated[int, Field(...,description='Lot Area in Square Fit',examples=['35868'])]
    floors : Annotated[float, Field(...,description='Floors in House',examples=['1','1.5'])]
    waterfront : Annotated[int, Field(...,ge=0,le=1,description='Yes(1) or No(0)',examples=['1'])]
    view : Annotated[int, Field(...,ge=0,le=1,description='Yes(1) or No(0)',examples=['1'])]
    condition : Annotated[int, Field(...,ge=1,le=5,description='Conditon of House out of 5',examples=['3'])]
    sqft_above : Annotated[int, Field(...,description='Above of House in Square Fit',examples=['3750'])]
    sqft_basement : Annotated[int, Field(...,description='Basement of House in Square Fit if House is no Basement then enter 0',examples=['1100'])]
    yr_built : Annotated[int, Field(...,description='Year in which this House Built',examples=['1969'])]
    yr_renovated : Annotated[int, Field(...,description='If this House is renovated then enter that year in which it is renovated else enter built year of this House',examples=['1969'])]
    city : Annotated[str, Field(...,description='Enter City Name in Which this House is located...', examples=['Shoreline'])]
    statezip : Annotated[str, Field(...,description='Enter Statezip', examples=['WA 98133'])]

class PredictionResponse(BaseModel):
    price : float

@app.get('/')
def show():
    return {'hello brother'}

@app.post('/predict')
def predict(data:dict):

        group_city = data.city if data.city in top_cities else 'other'
        
        input_df = pd.DataFrame([{
        'bedrooms' : data.bedrooms,
        'bathrooms' : data.bathrooms,
        'sqft_living' : data.sqft_living,
        'sqft_lot' : data.sqft_lot,
        'floors' : data.floors,
        'waterfront' : data.waterfront,
        'view' : data.view,
        'condition' : data.condition ,
        'sqft_above' : data.sqft_above,
        'sqft_basement' : data.sqft_basement,
        'yr_built' : data.yr_built,
        'yr_renovated' : data.yr_renovated,
        'grouped_cities' : group_city,
        'statezip' : data.statezip}])

        prediction = model.predict(input_df)[0]
        return PredictionResponse(price=prediction)