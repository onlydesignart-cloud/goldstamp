import { redirect } from 'next/navigation';
import { ADMIN_ROUTE_PREFIX } from '../../config/adminRoute';

export default function VaultMasterIndex() {
  redirect(`${ADMIN_ROUTE_PREFIX}/dashboard`);
}
