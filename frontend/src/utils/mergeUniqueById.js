export default function mergeUniqueById(prevData, newData){ //wtf
    if (!Array.isArray(newData)) return prevData;
    const existingIds = new Set(prevData.map((item) => item.id));
    return [...prevData, ...newData.filter((item) => !existingIds.has(item.id))];
};