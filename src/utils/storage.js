export const getStoredItem = key => {
	const getStorage = localStorage.getItem(key);
	if (getStorage === null) {
		return null;
	}

	return JSON.parse(getStorage);
};

export const storeItem = (key, value) => localStorage.setItem(key, JSON.stringify(value));

export const clearItems = items => {
	if (Array.isArray(items)) {
		items.forEach(item => localStorage.removeItem(item));
	}
};
