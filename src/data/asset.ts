/*
 * The CMS records an image as a path from the repository root
 * ("public/images/x.png") so that it points at the file where it already sits
 * and nothing gets moved or renamed on save. The browser needs the served URL
 * ("/images/x.png").
 *
 * Converting once, where content is loaded, keeps the templates free of path
 * juggling and means a new image field works without anyone having to remember
 * to convert it.
 */
export const assetUrl = (value: string) =>
	value.startsWith('public/') ? value.slice('public'.length) : value;

export const withAssetUrls = <T>(value: T): T => {
	if (typeof value === 'string') return assetUrl(value) as T;
	if (Array.isArray(value)) return value.map(withAssetUrls) as T;
	if (value && typeof value === 'object') {
		return Object.fromEntries(
			Object.entries(value).map(([key, inner]) => [key, withAssetUrls(inner)])
		) as T;
	}
	return value;
};
