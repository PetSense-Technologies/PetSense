from ultralytics import YOLO

#Cargar modelo
model = YOLO('best.pt')

#Genera un resumen de la arquitectura del modelo
model.info()

#Para ver las clases que aprendió
print("\nClases detectadas en el modelo:")
print(model.names)