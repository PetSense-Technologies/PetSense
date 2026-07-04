from ultralytics import YOLO

# Cargar tu modelo
model = YOLO('best.pt')

# Esto genera un resumen de la arquitectura del modelo
model.info()

# Opcional: Si quieres ver las clases que aprendió
print("\nClases detectadas en el modelo:")
print(model.names)