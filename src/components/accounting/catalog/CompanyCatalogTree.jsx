// src/components/accounting/catalog/CompanyCatalogTree.jsx
import React from 'react';
import Tree from 'rc-tree';
import 'rc-tree/assets/index.css';

const NodeTitle = ({ nodeData, onEdit }) => {
  // --- EL CAMBIO ESTÁ AQUÍ ---
  // Leemos `nodeData.active` en lugar de `nodeData.isActive`
  const titleClassName = nodeData.active ? "" : "title-inactive";

  return (
    <span className="node-title">
      <span className={titleClassName}>
        {`${nodeData.effectiveCode} - ${nodeData.effectiveName}`}
      </span>
      {/* --- Y TAMBIÉN AQUÍ --- 
          Solo mostramos el botón si la cuenta es editable Y está activa */}
      {nodeData.postable === true && nodeData.active === true && (
        <button className="edit-node-button" onClick={() => onEdit(nodeData)}>
          Editar
        </button>
      )}
    </span>
  );
};

const CompanyCatalogTree = ({ treeData, onEdit, selectedKeys, onSelectionChange }) => {
  
  const adaptDataWithEdit = (nodes) => {
    if (!nodes) return [];
    return nodes.map(node => ({
      key: node.id,
      title: <NodeTitle nodeData={node} onEdit={onEdit} />,
      children: adaptDataWithEdit(node.children),
      // --- Y FINALMENTE AQUÍ ---
      // Deshabilitamos el checkbox si la cuenta ya está inactiva
      disableCheckbox: !node.active,
      isLeaf: !node.children || node.children.length === 0
    }));
  };

  const adaptedData = adaptDataWithEdit(treeData);

  const handleCheck = (checkedKeys) => {
    onSelectionChange(checkedKeys.checked || checkedKeys);
  };

  return (
    <div className="tree-wrapper">
      <Tree
        checkable
        defaultExpandAll
        showIcon={false}
        switcherIcon={null}
        treeData={adaptedData}
        selectable={false}
        checkedKeys={selectedKeys}
        onCheck={handleCheck}
      />
    </div>
  );
};

export default React.memo(CompanyCatalogTree);