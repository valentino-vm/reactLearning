import { useState, useRef } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import './App.css'

// Tipo de item para DnD
const ItemTypes = {
  CARD: 'card',
}

interface Item {
  id: number;
  text: string;
}

interface DraggableItemProps {
  id: number;
  text: string;
  columnId: string;
  moveItem: (item: Item, source: string, destination: string) => void;
}

interface DroppableContainerProps {
  children: React.ReactNode;
  columnId: string;
  onDrop: (item: Item, source: string, destination: string) => void;
}

// Componente arrastrable
function DraggableItem({ id, text, columnId, moveItem }: DraggableItemProps) {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: () => ({ id, columnId }),
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  
  const dragElementRef = useRef<HTMLDivElement>(null);
  dragRef(dragElementRef);
  
  return (
    <div
      ref={dragElementRef}
      className={`p-3 my-2 bg-white rounded shadow cursor-move ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {text}
    </div>
  )
}

// Contenedor donde se pueden soltar items
function DroppableContainer({ children, columnId, onDrop }: DroppableContainerProps) {
  const dropElementRef = useRef<HTMLDivElement>(null);
  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: (item: any) => onDrop(item, item.columnId, columnId),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));
  dropRef(dropElementRef);
  
  return (
    <div
      ref={dropElementRef}
      className={`p-4 min-h-[200px] ${isOver ? 'bg-gray-300' : 'bg-gray-200'}`}
    >
      {children}
    </div>
  )
}

function App() {
  const [column1Items, setColumn1Items] = useState<Item[]>([
    { id: 1, text: 'Fix workshop' },
    { id: 2, text: 'Meeting at 9AM' },
  ])
  
  const [column2Items, setColumn2Items] = useState<Item[]>([
    { id: 3, text: 'Visit the zoo' },
    { id: 4, text: 'Wash Clothes' },
  ])
  
  const [column3Items, setColumn3Items] = useState<Item[]>([])

  const moveItem = (item: Item, source: string, destination: string) => {
    if (source === destination) return;
    
    // Mapeo de columnas y sus estados
    const columns: Record<string, { items: Item[]; setItems: React.Dispatch<React.SetStateAction<Item[]>> }> = {
      column1: { items: column1Items, setItems: setColumn1Items },
      column2: { items: column2Items, setItems: setColumn2Items },
      column3: { items: column3Items, setItems: setColumn3Items },
    };
    
    const sourceColumn = columns[source];
    const destColumn = columns[destination];
    
    if (!sourceColumn || !destColumn) return;

    // Eliminar de la columna origen
    const itemToMove = sourceColumn.items.find(i => i.id === item.id);
    if (!itemToMove) return;
    
    sourceColumn.setItems(prev => prev.filter(i => i.id !== item.id));
    
    // Añadir a la columna destino
    destColumn.setItems(prev => [...prev, itemToMove]);
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 min-h-screen">
        <h1 className="text-2xl font-bold text-center mb-8">
          Vite + React + Drag and Drop
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-200 rounded">
            <h2 className="p-3 font-bold">
              All Tasks
            </h2>
            <DroppableContainer columnId="column1" onDrop={moveItem}>
              {column1Items.map((item) => (
                <DraggableItem 
                  key={item.id} 
                  id={item.id} 
                  text={item.text}
                  columnId="column1"
                  moveItem={moveItem} 
                />
              ))}
              {column1Items.length === 0 && (
                <p className="text-center text-gray-500 p-4">
                  No items
                </p>
              )}
            </DroppableContainer>
          </div>
          
          <div className="bg-gray-200 rounded">
            <h2 className="p-3 font-bold">
              In progress
            </h2>
            <DroppableContainer columnId="column2" onDrop={moveItem}>
              {column2Items.map((item) => (
                <DraggableItem 
                  key={item.id} 
                  id={item.id} 
                  text={item.text}
                  columnId="column2"
                  moveItem={moveItem} 
                />
              ))}
              {column2Items.length === 0 && (
                <p className="text-center text-gray-500 p-4">
                  Drag items here
                </p>
              )}
            </DroppableContainer>
          </div>
          
          <div className="bg-gray-200 rounded">
            <h2 className="p-3 font-bold">
              Paused
            </h2>
            <DroppableContainer columnId="column3" onDrop={moveItem}>
              {column3Items.map((item) => (
                <DraggableItem 
                  key={item.id} 
                  id={item.id} 
                  text={item.text}
                  columnId="column3"
                  moveItem={moveItem} 
                />
              ))}
              {column3Items.length === 0 && (
                <p className="text-center text-gray-500 p-4">
                  Drag items here
                </p>
              )}
            </DroppableContainer>
          </div>
        </div>
      </div>
    </DndProvider>
  )
}

export default App
