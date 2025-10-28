// src/components/accounting/catalog/MasterCatalogTree.jsx
import React from 'react';
import Tree from 'rc-tree';
import 'rc-tree/assets/index.css';

const MasterCatalogTree = ({ treeData, checkedKeys, onSelectionChange, activeMasterIds }) => {
  
  const adaptDataToTree = (nodes) => {
    if (!nodes) return [];
    return nodes.map(node => ({
      key: node.id,
      title: `${node.code} - ${node.name}`,
      children: adaptDataToTree(node.children),
      disableCheckbox: activeMasterIds.has(node.id),
      // Es crucial que cada nodo sepa si es una "hoja"
      isLeaf: !node.children || node.children.length === 0
    }));
  };
  
  const adaptedData = adaptDataToTree(treeData);

  // --- LA CORRECCIÓN DEFINITIVA ESTÁ AQUÍ ---
  const handleCheck = (keys, info) => {
    // `info.checkedNodes` es un array de todos los nodos que están visualmente marcados.
    // Vamos a filtrar este array para quedarnos solo con los nodos que son "hojas" (isLeaf: true).
    const leafKeys = info.checkedNodes
      .filter(node => node.isLeaf)
      .map(node => node.key);

    // Enviamos al componente padre únicamente la lista de IDs de las hojas seleccionadas.
    onSelectionChange(leafKeys);
  };

  return (
    <div className="tree-wrapper">
      <Tree
        checkable
        defaultExpandAll
        showIcon={false}
        switcherIcon={null}
        
        // `checkedKeys` ahora solo contiene los IDs de las hojas.
        // `rc-tree` es lo suficientemente inteligente para calcular a partir de esta lista
        // qué padres debe mostrar como semi-seleccionados o completamente seleccionados.
        checkedKeys={checkedKeys}
        onCheck={handleCheck}
        treeData={adaptedData}
      />
    </div>
  );
};

export default React.memo(MasterCatalogTree);